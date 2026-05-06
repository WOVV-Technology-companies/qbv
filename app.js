const STORAGE_KEY = "offline-web-wallet-v1";
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

let wallet = null;
let encryptedVault = null;
let saveTimer = null;

const $ = (id) => document.getElementById(id);

const elements = {
  lockedPanel: $("lockedPanel"),
  walletPanel: $("walletPanel"),
  createForm: $("createForm"),
  unlockForm: $("unlockForm"),
  assetForm: $("assetForm"),
  accountForm: $("accountForm"),
  txForm: $("txForm"),
  importFile: $("importFile"),
  exportBtn: $("exportBtn"),
  lockBtn: $("lockBtn"),
  toast: $("toast"),
  networkStatus: $("networkStatus"),
  deriveForm: $("deriveForm"),
  deriveResults: $("deriveResults"),
  signForm: $("signForm"),
  signatureOutput: $("signatureOutput"),
};

function toBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function newWallet(name) {
  return {
    version: 1,
    name: name || "离线钱包",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assets: [],
    accounts: [],
    transactions: [],
  };
}

async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptWallet(data, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const payload = textEncoder.encode(JSON.stringify(data));
  const cipherText = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload);

  return {
    app: "offline-web-wallet",
    version: 1,
    kdf: "PBKDF2-SHA256",
    iterations: 310000,
    cipher: "AES-256-GCM",
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(cipherText),
    exportedAt: new Date().toISOString(),
  };
}

async function decryptWallet(vault, password) {
  if (!vault?.salt || !vault?.iv || !vault?.data) {
    throw new Error("备份文件格式无效");
  }

  const key = await deriveKey(password, fromBase64(vault.salt));
  const plainText = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(vault.iv) }, key, fromBase64(vault.data));
  return JSON.parse(textDecoder.decode(plainText));
}

function persistVault(vault) {
  encryptedVault = vault;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vault));
}

async function saveWallet() {
  if (!wallet?.password) return;
  wallet.updatedAt = new Date().toISOString();
  const { password, ...safeWallet } = wallet;
  persistVault(await encryptWallet(safeWallet, password));
}

function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveWallet().catch((error) => notify(error.message)), 250);
}

function notify(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  clearTimeout(elements.toast.timer);
  elements.toast.timer = setTimeout(() => elements.toast.classList.add("hidden"), 2800);
}

function updateNetworkStatus() {
  const online = navigator.onLine;
  elements.networkStatus.textContent = online ? "当前在线：建议断网后使用" : "当前离线：适合冷钱包操作";
  elements.networkStatus.className = `status ${online ? "online" : "offline"}`;
}

function showWallet() {
  elements.lockedPanel.classList.add("hidden");
  elements.walletPanel.classList.remove("hidden");
  render();
}

function showLocked() {
  wallet = null;
  elements.walletPanel.classList.add("hidden");
  elements.lockedPanel.classList.remove("hidden");
  elements.unlockForm.reset();
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[char]);
}

function setList(container, items, renderer, emptyText) {
  container.classList.toggle("empty", items.length === 0);
  container.innerHTML = items.length ? items.map(renderer).join("") : emptyText;
}

function renderDerivationResults(rows) {
  elements.deriveResults.classList.toggle("empty", rows.length === 0);
  elements.deriveResults.innerHTML = rows.length
    ? `<table>
        <thead><tr><th>网络 / 币种</th><th>路径</th><th>地址</th><th>公钥</th><th>私钥</th><th>WIF</th><th>操作</th></tr></thead>
        <tbody>${rows.map((row) => `<tr>
          <td>${escapeHtml(row.name)}</td>
          <td><code>${escapeHtml(row.path)}</code></td>
          <td><code>${escapeHtml(row.address)}</code></td>
          <td><code>${escapeHtml(row.publicKeyHex)}</code></td>
          <td><code>${escapeHtml(row.privateKeyHex)}</code></td>
          <td><code>${escapeHtml(row.wif || "—")}</code></td>
          <td class="row-actions">
            <button type="button" class="secondary mini" data-sign-key="${escapeHtml(row.privateKeyHex)}" data-sign-mode="${escapeHtml(row.sign)}">签名</button>
            <button type="button" class="secondary mini" data-import-address="${escapeHtml(row.address)}" data-import-asset="${escapeHtml(row.coin)}" data-import-label="${escapeHtml(row.name)}">加入钱包</button>
          </td>
        </tr>`).join("")}</tbody>
      </table>`
    : "尚未生成。支持 EVM 网络、BTC、LTC、DOGE、DASH。";
}

function renderSelectors() {
  const options = wallet.assets
    .map((asset) => `<option value="${escapeHtml(asset.id)}">${escapeHtml(asset.symbol)} · ${escapeHtml(asset.name)}</option>`)
    .join("");
  [$("accountAsset"), $("txAsset")].forEach((select) => {
    select.innerHTML = options || '<option value="">请先添加资产</option>';
    select.disabled = !options;
  });
}

function assetLabel(assetId) {
  const asset = wallet.assets.find((item) => item.id === assetId);
  return asset ? `${asset.symbol} · ${asset.name}` : "未知资产";
}

function render() {
  $("walletTitle").textContent = wallet.name;
  $("assetCount").textContent = wallet.assets.length;
  $("accountCount").textContent = wallet.accounts.length;
  $("txCount").textContent = wallet.transactions.length;

  renderSelectors();

  setList(
    $("assetList"),
    wallet.assets,
    (asset) => `<div class="item"><header><strong>${escapeHtml(asset.symbol)}</strong><small>${formatDate(asset.createdAt)}</small></header><p>${escapeHtml(asset.name)}</p><p>${escapeHtml(asset.note)}</p></div>`,
    "暂无资产",
  );

  setList(
    $("accountList"),
    wallet.accounts,
    (account) => `<div class="item"><header><strong>${escapeHtml(account.label)}</strong><small>${escapeHtml(assetLabel(account.assetId))}</small></header><p>${escapeHtml(account.address)}</p></div>`,
    "暂无账户",
  );

  setList(
    $("txList"),
    wallet.transactions,
    (tx) => `<div class="item"><header><strong>${escapeHtml(tx.direction)} ${escapeHtml(tx.amount)} ${escapeHtml(assetLabel(tx.assetId))}</strong><small>${formatDate(tx.createdAt)}</small></header><p>${escapeHtml(tx.memo)}</p></div>`,
    "暂无交易备忘",
  );
}

function readStoredVault() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

async function createWallet(event) {
  event.preventDefault();
  const password = $("newPassword").value;
  const confirmed = $("confirmPassword").value;

  if (password.length < 10) {
    notify("主密码至少需要 10 个字符");
    return;
  }
  if (password !== confirmed) {
    notify("两次输入的主密码不一致");
    return;
  }

  wallet = { ...newWallet($("walletName").value.trim()), password };
  await saveWallet();
  elements.createForm.reset();
  showWallet();
  notify("钱包已创建并加密保存");
}

async function unlockWallet(event) {
  event.preventDefault();
  const vault = readStoredVault();
  if (!vault) {
    notify("本机没有已保存的钱包，请先创建或导入备份");
    return;
  }

  try {
    wallet = { ...(await decryptWallet(vault, $("unlockPassword").value)), password: $("unlockPassword").value };
    encryptedVault = vault;
    showWallet();
    notify("钱包已解锁");
  } catch {
    notify("解锁失败：密码错误或数据损坏");
  }
}

function addAsset(event) {
  event.preventDefault();
  wallet.assets.unshift({
    id: crypto.randomUUID(),
    name: $("assetName").value.trim(),
    symbol: $("assetSymbol").value.trim().toUpperCase(),
    note: $("assetNote").value.trim(),
    createdAt: new Date().toISOString(),
  });
  elements.assetForm.reset();
  render();
  queueSave();
  notify("资产已保存");
}

function addAccount(event) {
  event.preventDefault();
  wallet.accounts.unshift({
    id: crypto.randomUUID(),
    assetId: $("accountAsset").value,
    label: $("accountLabel").value.trim(),
    address: $("accountAddress").value.trim(),
    createdAt: new Date().toISOString(),
  });
  elements.accountForm.reset();
  render();
  queueSave();
  notify("账户已保存");
}

function addTransaction(event) {
  event.preventDefault();
  wallet.transactions.unshift({
    id: crypto.randomUUID(),
    assetId: $("txAsset").value,
    amount: $("txAmount").value,
    direction: $("txDirection").value,
    memo: $("txMemo").value.trim(),
    createdAt: new Date().toISOString(),
  });
  elements.txForm.reset();
  render();
  queueSave();
  notify("交易备忘已保存");
}

function exportBackup() {
  const vault = encryptedVault || readStoredVault();
  if (!vault) {
    notify("没有可导出的加密备份");
    return;
  }

  const blob = new Blob([JSON.stringify(vault, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `offline-wallet-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importBackup(event) {
  const [file] = event.target.files;
  if (!file) return;

  try {
    const vault = JSON.parse(await file.text());
    if (!vault?.data || !vault?.salt || !vault?.iv) throw new Error("invalid");
    persistVault(vault);
    notify("备份已导入，请使用原主密码解锁");
  } catch {
    notify("导入失败：请选择有效的加密备份 JSON");
  } finally {
    event.target.value = "";
  }
}

async function deriveFromMnemonic(event) {
  event.preventDefault();
  const button = elements.deriveForm.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "生成中…";
  try {
    const rows = await walletCore.deriveWallets($("mnemonicInput").value, $("mnemonicPassphrase").value, $("accountIndex").value);
    renderDerivationResults(rows);
    notify("地址和密钥已在本地生成");
  } catch (error) {
    notify(error.message || "派生失败");
  } finally {
    button.disabled = false;
    button.textContent = "生成地址 / 密钥";
  }
}

async function signOfflineMessage(event) {
  event.preventDefault();
  try {
    const result = await walletCore.signMessage($("signPrivateKey").value.trim(), $("signMessage").value, $("signMode").value);
    elements.signatureOutput.textContent = JSON.stringify(result, null, 2);
    elements.signatureOutput.classList.remove("hidden");
    notify("签名已生成");
  } catch (error) {
    notify(error.message || "签名失败");
  }
}

function findOrCreateGeneratedAsset(symbol) {
  let asset = wallet.assets.find((item) => item.symbol === symbol);
  if (!asset) {
    asset = {
      id: crypto.randomUUID(),
      name: `${symbol} 派生地址`,
      symbol,
      note: "由离线助记词派生工具加入",
      createdAt: new Date().toISOString(),
    };
    wallet.assets.unshift(asset);
  }
  return asset;
}

function handleDerivationAction(event) {
  const signButton = event.target.closest("[data-sign-key]");
  if (signButton) {
    $("signPrivateKey").value = signButton.dataset.signKey;
    $("signMode").value = signButton.dataset.signMode;
    $("signMessage").focus();
    notify("私钥已填入签名表单，请确认离线环境");
    return;
  }

  const importButton = event.target.closest("[data-import-address]");
  if (!importButton) return;
  if (!wallet) {
    notify("请先创建或解锁本机钱包，再加入地址");
    return;
  }

  const symbol = importButton.dataset.importAsset;
  const asset = findOrCreateGeneratedAsset(symbol);
  wallet.accounts.unshift({
    id: crypto.randomUUID(),
    assetId: asset.id,
    label: importButton.dataset.importLabel,
    address: importButton.dataset.importAddress,
    createdAt: new Date().toISOString(),
  });
  render();
  queueSave();
  notify("派生地址已加入本机钱包记录");
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      notify("离线缓存注册失败，但页面仍可作为本地文件使用");
    });
  }
}

function bindEvents() {
  elements.createForm.addEventListener("submit", createWallet);
  elements.unlockForm.addEventListener("submit", unlockWallet);
  elements.assetForm.addEventListener("submit", addAsset);
  elements.accountForm.addEventListener("submit", addAccount);
  elements.txForm.addEventListener("submit", addTransaction);
  elements.exportBtn.addEventListener("click", exportBackup);
  elements.lockBtn.addEventListener("click", showLocked);
  elements.importFile.addEventListener("change", importBackup);
  elements.deriveForm.addEventListener("submit", deriveFromMnemonic);
  elements.deriveResults.addEventListener("click", handleDerivationAction);
  elements.signForm.addEventListener("submit", signOfflineMessage);
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
}

bindEvents();
updateNetworkStatus();
registerServiceWorker();
encryptedVault = readStoredVault();
