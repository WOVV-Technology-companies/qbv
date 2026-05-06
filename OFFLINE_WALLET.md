# 离线网页钱包

为避免与目标分支中的 `README.md`、`index.html`、`app.js`、`styles.css` 和 `service-worker.js` 产生合并冲突，离线钱包现在以新增的 `offline-wallet.html` 单页入口提供。

## 使用

1. 将 `offline-wallet.html` 和 `wallet-core.js` 复制到可信设备的同一目录。
2. 断开网络后打开 `offline-wallet.html`。
3. 可创建加密本机钱包，或输入英文 BIP39 助记词生成多网络地址、密钥并进行离线消息签名。

## 支持能力

- 本机钱包数据使用 Web Crypto 的 PBKDF2-SHA256 + AES-256-GCM 加密后保存。
- 支持导出/导入加密 JSON 备份。
- 支持 EVM 网络、BTC、LTC、DOGE、DASH 地址和密钥派生。
- 支持 EVM `personal_sign` 和 Bitcoin-style 消息签名。

## 安全提示

- 请只在完全离线且可信的系统中输入助记词、passphrase 或私钥。
- 主密码、助记词、passphrase、私钥无法找回。
- 当前签名功能是消息签名，不会构造、广播链上交易。
