# 离线网页钱包

为避免与目标分支中的 `README.md`、`index.html`、`app.js`、`styles.css` 和 `service-worker.js` 产生合并冲突，离线钱包以新增的 `offline-wallet.html` 单页入口提供。

## 使用

1. 将 `offline-wallet.html` 和 `wallet-core.js` 复制到可信设备的同一目录。
2. 断开网络后打开 `offline-wallet.html`。
3. 可创建加密本机钱包，或输入英文 BIP39 助记词生成地址、密钥并进行离线消息签名。
4. 助记词派生区默认选择 Bitcoin；如需其他货币 / 网络，请使用下拉框选择。
5. 每次只显示一种货币 / 网络，并固定生成 36 个连续地址（从“起始序号”开始）。

## 支持能力

- 本机钱包数据使用 Web Crypto 的 PBKDF2-SHA256 + AES-256-GCM 加密后保存。
- 支持导出/导入加密 JSON 备份。
- 支持下拉选择多种 EVM 网络和 UTXO 货币，包括 Bitcoin、Litecoin、Dogecoin、Dash、Bitcoin Cash legacy、DigiByte、Vertcoin、Ravencoin、Qtum、Namecoin、Peercoin、Viacoin、ReddCoin、Feathercoin，以及 Ethereum、BNB Smart Chain、Polygon、Base、Arbitrum、Optimism、Avalanche、Fantom、Gnosis、Cronos、Celo、Moonbeam、Moonriver、Harmony、Kava、Linea、zkSync Era、Scroll、Mantle、Blast、opBNB、Ethereum Classic 等 EVM 网络。
- 支持 EVM `personal_sign` 和 Bitcoin-style 消息签名。

## 安全提示

- 请只在完全离线且可信的系统中输入助记词、passphrase 或私钥。
- 主密码、助记词、passphrase、私钥无法找回。
- 当前签名功能是消息签名，不会构造、广播链上交易。
- 本工具覆盖常见 secp256k1/BIP32 派生网络；使用前请核对目标钱包的派生路径和地址格式。
