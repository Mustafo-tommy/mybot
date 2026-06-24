const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const input = require("input");

// ===== НАСТРОЙКИ =====
const API_ID = 30040757;
const API_HASH = "af60d8abc48971095d979e94226153a8";

const AUTO_REPLY_MESSAGE = "Привет я Сейчас недоступен напишу чуть позже";
// =====================

const alreadyReplied = new Set();
const stringSession = new StringSession("");

(async () => {
  const client = new TelegramClient(stringSession, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () =>
      await input.text("Введи номер телефона (+код страны): "),
    password: async () =>
      await input.text("Введи пароль 2FA (если нет — просто Enter): "),
    phoneCode: async () => await input.text("Введи код из Telegram: "),
    onError: (err) => console.log("Ошибка:", err),
  });

  console.log("✅ Юзербот запущен! Теперь он будет отвечать за тебя.");
  console.log("Чтобы остановить — нажми Ctrl+C");

  const me = await client.getMe();

  client.addEventHandler(
    async (event) => {
      const message = event.message;

      if (!message.peerId?.userId) return;

      const senderId = message.peerId.userId.toString();

      if (senderId === me.id.toString()) return;

      if (alreadyReplied.has(senderId)) return;

      try {
        const sender = await client.getEntity(senderId);
        if (sender.bot) return;

        alreadyReplied.add(senderId);

        await new Promise((r) => setTimeout(r, 1000));
        await client.sendMessage(senderId, { message: AUTO_REPLY_MESSAGE });

        console.log(`✉️  Ответил: ${sender.firstName} (id: ${senderId})`);
      } catch (e) {
        console.log("Ошибка при ответе:", e.message);
      }
    },
    new NewMessage({ incoming: true }),
  );

  await new Promise(() => {});
})();
