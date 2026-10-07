"""Telegram-бот проверки оплаты книжного сообщества (aiogram 3)."""
import asyncio
import json
import logging
import os
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import aiohttp
from aiogram import Bot, Dispatcher, F, Router
from aiogram.filters import Command, CommandObject
from aiogram.types import CallbackQuery, InlineKeyboardMarkup, Message
from aiogram.utils.keyboard import InlineKeyboardBuilder
from dotenv import load_dotenv

BASE = Path(__file__).resolve().parent
load_dotenv(BASE / ".env")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("club-bot")

DAY = 24 * 3600
REMINDER_DAYS = [1, 3]  # предупреждения за 1 и за 3 дня (от самого срочного)
PLAN_DAYS = {"month": 45, "quarter": 105}  # срок доступа в днях: 1 мес = 45, 3 мес = 105


def need(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise SystemExit(f"Не задана переменная {name} в pybot/.env (см. README.md)")
    return value


def ids(raw: str) -> list[int]:
    return [int(x) for x in raw.replace(" ", "").split(",") if x.strip("-").isdigit()]


TOKEN = need("BOT_TOKEN")
ADMIN_IDS = ids(need("ADMIN_TG_IDS"))  # команды /members, /grant
# Кому приходят чеки и кто нажимает «Подтвердить» (по умолчанию — все админы)
RECEIPT_IDS = ids(os.getenv("RECEIPT_TG_IDS", "")) or ADMIN_IDS
CHAT_IDS = ids(need("GROUP_CHAT_IDS"))
PAYMENT_DETAILS = need("PAYMENT_DETAILS").replace("\\n", "\n")
CONTENT_URL = os.getenv("CONTENT_URL", "").strip()
if not ADMIN_IDS or not CHAT_IDS:
    raise SystemExit("ADMIN_TG_IDS и GROUP_CHAT_IDS должны содержать числовые id через запятую")


# ───────────── Тарифы (цены берутся с сайта, иначе из .env) ─────────────

_plans_cache: tuple[float, dict] | None = None


async def get_plans() -> dict:
    global _plans_cache
    if _plans_cache and time.time() - _plans_cache[0] < 300:
        return _plans_cache[1]
    plans = {
        "month": {"name": "1 месяц", "price": int(os.getenv("PRICE_MONTH", "2000"))},
        "quarter": {"name": "3 месяца", "price": int(os.getenv("PRICE_QUARTER", "4000"))},
    }
    if CONTENT_URL:
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as s:
                async with s.get(CONTENT_URL) as r:
                    data = await r.json()
            for key, item in zip(("month", "quarter"), data["plans"]):
                plans[key] = {"name": str(item["name"]), "price": int(item["price"])}
        except Exception as e:  # сайт недоступен — используем запасные значения
            log.warning("Не удалось получить цены с сайта: %s", e)
    _plans_cache = (time.time(), plans)
    return plans


# ───────────── Хранилище ─────────────

DATA_FILE = BASE / "data" / "members.json"


class Store:
    def __init__(self) -> None:
        self.db = {"members": {}, "requests": {}, "pending_plan": {}, "receipts": []}
        try:
            self.db.update(json.loads(DATA_FILE.read_text("utf-8")))
        except (FileNotFoundError, json.JSONDecodeError):
            pass

    def save(self) -> None:
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        tmp = DATA_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(self.db, ensure_ascii=False, indent=2), "utf-8")
        tmp.replace(DATA_FILE)


store = Store()
members: dict = store.db["members"]
requests: dict = store.db["requests"]


def is_active(m: dict | None) -> bool:
    return bool(m and m["expires_at"] > time.time())


def fmt_date(ts: float) -> str:
    months = "января февраля марта апреля мая июня июля августа сентября октября ноября декабря".split()
    d = datetime.fromtimestamp(ts)
    return f"{d.day} {months[d.month - 1]} {d.year}"


def money(n: int) -> str:
    return f"{n:,}".replace(",", " ") + " сом"


def full_name(u) -> str:
    return " ".join(p for p in (u.first_name, u.last_name) if p)


async def plan_keyboard() -> InlineKeyboardMarkup:
    kb = InlineKeyboardBuilder()
    for key, p in (await get_plans()).items():
        kb.button(text=f"{p['name']} — {money(p['price'])}", callback_data=f"plan:{key}")
    kb.adjust(1)
    return kb.as_markup()


async def safe_send(bot: Bot, chat_id: int, text: str, **kw) -> bool:
    try:
        await bot.send_message(chat_id, text, **kw)
        return True
    except Exception as e:  # пользователь мог заблокировать бота
        log.warning("Не удалось написать %s: %s", chat_id, e)
        return False


async def invite_links(bot: Bot, user_id: int) -> list[str]:
    links = []
    for chat_id in CHAT_IDS:
        link = await bot.create_chat_invite_link(
            chat_id,
            name=f"user {user_id}"[:32],
            member_limit=1,
            expire_date=datetime.now(timezone.utc) + timedelta(days=1),
        )
        links.append(link.invite_link)
    return links


router = Router()
private = F.chat.type == "private"

# ───────────── Участник ─────────────


@router.message(Command("start"), private)
async def cmd_start(m: Message) -> None:
    mem = members.get(str(m.from_user.id))
    status = f"\n\nВаша подписка активна до {fmt_date(mem['expires_at'])}. Можно продлить заранее." if is_active(mem) else ""
    await m.answer(
        f"Здравствуйте! Это бот книжного сообщества по психологии. Выберите тариф, чтобы вступить или продлить участие.{status}",
        reply_markup=await plan_keyboard(),
    )


@router.callback_query(F.data.regexp(r"^plan:(month|quarter)$"))
async def on_plan(cb: CallbackQuery) -> None:
    key = cb.data.split(":")[1]
    plan = (await get_plans())[key]
    await cb.answer()
    if any(r["user_id"] == cb.from_user.id and r["status"] == "pending" for r in requests.values()):
        await cb.message.answer("Ваш чек уже на проверке — обычно это занимает немного времени. Мы напишем вам.")
        return
    store.db["pending_plan"][str(cb.from_user.id)] = key
    store.save()
    await cb.message.answer(
        f"Тариф: {plan['name']}, {money(plan['price'])}\n\nРеквизиты для оплаты:\n{PAYMENT_DETAILS}\n\n"
        "После перевода пришлите сюда скриншот или фото чека (одним сообщением)."
    )


@router.message(F.photo | F.document, private)
async def on_receipt(m: Message, bot: Bot) -> None:
    uid = m.from_user.id
    if uid in RECEIPT_IDS:
        return
    plan_key = store.db["pending_plan"].get(str(uid))
    if not plan_key:
        await m.answer("Сначала выберите тариф:", reply_markup=await plan_keyboard())
        return

    file_uid = m.photo[-1].file_unique_id if m.photo else m.document.file_unique_id
    if file_uid in store.db["receipts"]:
        await m.answer("Этот чек уже был отправлен ранее. Пришлите актуальный чек об оплате.")
        return

    plan = (await get_plans())[plan_key]
    req_id = f"{int(time.time() * 1000):x}{uid:x}"
    requests[req_id] = {
        "id": req_id, "user_id": uid, "username": m.from_user.username, "name": full_name(m.from_user),
        "plan": plan_key, "amount": plan["price"], "status": "pending", "created_at": time.time(),
    }
    store.db["receipts"].append(file_uid)
    store.db["pending_plan"].pop(str(uid), None)
    store.save()

    handle = f" (@{m.from_user.username})" if m.from_user.username else ""
    caption = (
        f"💳 Новая оплата\n{full_name(m.from_user)}{handle}\n"
        f"Тариф: {plan['name']} — {money(plan['price'])}\nСверьте сумму и получателя в банковском приложении."
    )
    kb = InlineKeyboardBuilder()
    kb.button(text="✅ Подтвердить", callback_data=f"ok:{req_id}")
    kb.button(text="❌ Отклонить", callback_data=f"no:{req_id}")
    for admin in RECEIPT_IDS:
        try:
            await bot.copy_message(admin, m.chat.id, m.message_id, caption=caption, reply_markup=kb.as_markup())
        except Exception as e:
            log.error("Не удалось отправить чек админу %s: %s", admin, e)
    await m.answer("Чек получен, проверяем оплату. Как только подтвердим — пришлём ссылку для вступления.")


# ───────────── Админ: решение по оплате ─────────────


@router.callback_query(F.data.regexp(r"^(ok|no):.+"))
async def on_decision(cb: CallbackQuery, bot: Bot) -> None:
    if cb.from_user.id not in RECEIPT_IDS:
        await cb.answer("Нет доступа")
        return
    action, req_id = cb.data.split(":", 1)
    req = requests.get(req_id)
    if not req or req["status"] != "pending":
        await cb.answer("Уже обработано")
        return

    async def mark(text: str) -> None:
        await cb.answer()
        try:
            await cb.message.edit_caption(caption=f"{cb.message.caption or ''}\n\n{text}")
        except Exception:
            pass

    if action == "no":
        req["status"], req["decided_by"] = "rejected", cb.from_user.id
        store.save()
        await mark(f"❌ Отклонено ({full_name(cb.from_user)})")
        await safe_send(bot, req["user_id"], "К сожалению, оплату подтвердить не удалось. "
                        "Проверьте сумму и реквизиты и пришлите чек заново: /start")
        return

    key = req["plan"]
    prev = members.get(str(req["user_id"]))
    was_active = is_active(prev)
    base = prev["expires_at"] if was_active else time.time()
    expires = base + PLAN_DAYS[key] * DAY

    links: list[str] = []
    if not was_active:
        try:
            links = await invite_links(bot, req["user_id"])
        except Exception as e:
            log.error("Ссылки не созданы: %s", e)
            await cb.answer("Не удалось создать ссылку: бот должен быть админом в чатах", show_alert=True)
            return

    req["status"], req["decided_by"] = "approved", cb.from_user.id
    members[str(req["user_id"])] = {
        "user_id": req["user_id"], "username": req.get("username"), "name": req["name"],
        "plan": key, "expires_at": expires, "reminders": [],
    }
    store.save()
    await mark(f"✅ Подтверждено до {fmt_date(expires)} ({full_name(cb.from_user)})")
    if was_active:
        text = f"Оплата подтверждена, участие продлено до {fmt_date(expires)}. Спасибо!"
    else:
        text = (f"Оплата подтверждена! Доступ открыт до {fmt_date(expires)}.\n\n"
                "Ссылки для вступления (каждая действует 24 часа и только для одного человека):\n" + "\n".join(links))
    await safe_send(bot, req["user_id"], text)


# ───────────── Админ: команды ─────────────


@router.message(Command("members"), F.from_user.id.in_(ADMIN_IDS))
async def cmd_members(m: Message) -> None:
    items = sorted(members.values(), key=lambda x: x["expires_at"])
    if not items:
        await m.answer("Участников пока нет.")
        return
    lines = [
        f"{'🟢' if is_active(x) else '⚪️'} {x['name']}{' @' + x['username'] if x.get('username') else ''} — до {fmt_date(x['expires_at'])}"
        for x in items
    ]
    await m.answer("\n".join(lines)[:4000])


@router.message(Command("grant"), F.from_user.id.in_(ADMIN_IDS))
async def cmd_grant(m: Message, command: CommandObject, bot: Bot) -> None:
    """/grant <id> <дней> — выдать или продлить доступ вручную."""
    try:
        uid, days = (int(x) for x in (command.args or "").split())
        assert 1 <= days <= 400
    except Exception:
        await m.answer("Формат: /grant <id пользователя> <дней>")
        return
    prev = members.get(str(uid))
    was_active = is_active(prev)
    base = prev["expires_at"] if was_active else time.time()
    members[str(uid)] = {
        "user_id": uid, "username": (prev or {}).get("username"), "name": (prev or {}).get("name", f"id {uid}"),
        "plan": (prev or {}).get("plan", "month"), "expires_at": base + days * DAY, "reminders": [],
    }
    store.save()
    text = f"Доступ для {uid} до {fmt_date(members[str(uid)]['expires_at'])}."
    if not was_active:
        text += "\nСсылки (24 ч, одноразовые):\n" + "\n".join(await invite_links(bot, uid))
    await m.answer(text)


# ───────────── Истечение срока и напоминания ─────────────


async def sweep(bot: Bot) -> None:
    now = time.time()
    for key, mem in list(members.items()):
        try:
            if mem["expires_at"] <= now:
                if mem["user_id"] in ADMIN_IDS or mem["user_id"] in RECEIPT_IDS:
                    continue
                for chat_id in CHAT_IDS:
                    try:
                        await bot.ban_chat_member(chat_id, mem["user_id"])
                        await bot.unban_chat_member(chat_id, mem["user_id"], only_if_banned=True)  # убрать, но не банить
                    except Exception as e:
                        log.error("Не удалось удалить %s из %s: %s", mem["user_id"], chat_id, e)
                await safe_send(bot, mem["user_id"], "Срок вашего участия закончился. "
                                "Чтобы вернуться в сообщество, оформите продление: /start")
                del members[key]
                store.save()
                log.info("Удалён по окончании срока: %s (%s)", mem["name"], mem["user_id"])
                continue

            left = mem["expires_at"] - now
            sent = mem.setdefault("reminders", [])
            stage = next((d for d in REMINDER_DAYS if left <= d * DAY and d not in sent), None)
            if stage is None:
                continue
            when = "завтра" if stage == 1 else f"через {stage} дня"
            await safe_send(
                bot, mem["user_id"],
                f"⏰ Ваше участие в сообществе заканчивается {when} ({fmt_date(mem['expires_at'])}). "
                "Чтобы остаться в чатах, продлите подписку:",
                reply_markup=await plan_keyboard(),
            )
            mem["reminders"] = sorted(set(sent) | {d for d in REMINDER_DAYS if d >= stage})
            store.save()
        except Exception:
            log.exception("Ошибка при обработке участника %s", key)


async def sweep_loop(bot: Bot) -> None:
    while True:
        try:
            await sweep(bot)
        except Exception:
            log.exception("Ошибка sweep")
        await asyncio.sleep(3600)


async def main() -> None:
    bot = Bot(TOKEN)
    dp = Dispatcher()
    dp.include_router(router)
    me = await bot.get_me()
    log.info("Бот @%s запущен", me.username)
    task = asyncio.create_task(sweep_loop(bot))
    try:
        await dp.start_polling(bot)
    finally:
        task.cancel()


if __name__ == "__main__":
    asyncio.run(main())
