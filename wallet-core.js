(() => {
  const P = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;
  const N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
  const G = {
    x: 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
    y: 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n,
  };
  const HARDENED = 0x80000000;
  const textEncoder = new TextEncoder();
  const hex = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));

  const NETWORKS = [
    { id: "btc", name: "Bitcoin Native SegWit / BTC", coin: "BTC", path: "m/84'/0'/0'/0/{i}", kind: "bech32", hrp: "bc", sign: "btc" },
    { id: "btc_legacy", name: "Bitcoin Legacy / BTC", coin: "BTC", path: "m/44'/0'/0'/0/{i}", kind: "p2pkh", p2pkh: 0x00, wif: 0x80, sign: "btc" },
    { id: "eth", name: "Ethereum / ETH", coin: "ETH", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "etc", name: "Ethereum Classic / ETC", coin: "ETC", path: "m/44'/61'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "bsc", name: "BNB Smart Chain / BNB", coin: "BNB", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "polygon", name: "Polygon / POL", coin: "POL", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "base", name: "Base / ETH", coin: "ETH", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "arbitrum", name: "Arbitrum One / ETH", coin: "ETH", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "optimism", name: "Optimism / ETH", coin: "ETH", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "avax", name: "Avalanche C-Chain / AVAX", coin: "AVAX", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "fantom", name: "Fantom Opera / FTM", coin: "FTM", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "gnosis", name: "Gnosis Chain / xDAI", coin: "xDAI", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "cronos", name: "Cronos EVM / CRO", coin: "CRO", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "celo", name: "Celo / CELO", coin: "CELO", path: "m/44'/52752'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "moonbeam", name: "Moonbeam / GLMR", coin: "GLMR", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "moonriver", name: "Moonriver / MOVR", coin: "MOVR", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "harmony", name: "Harmony EVM / ONE", coin: "ONE", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "kava", name: "Kava EVM / KAVA", coin: "KAVA", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "linea", name: "Linea / ETH", coin: "ETH", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "zksync", name: "zkSync Era / ETH", coin: "ETH", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "scroll", name: "Scroll / ETH", coin: "ETH", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "mantle", name: "Mantle / MNT", coin: "MNT", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "blast", name: "Blast / ETH", coin: "ETH", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "opbnb", name: "opBNB / BNB", coin: "BNB", path: "m/44'/60'/0'/0/{i}", kind: "evm", sign: "evm" },
    { id: "ltc", name: "Litecoin Native SegWit / LTC", coin: "LTC", path: "m/84'/2'/0'/0/{i}", kind: "bech32", hrp: "ltc", sign: "btc" },
    { id: "ltc_legacy", name: "Litecoin Legacy / LTC", coin: "LTC", path: "m/44'/2'/0'/0/{i}", kind: "p2pkh", p2pkh: 0x30, wif: 0xb0, sign: "btc" },
    { id: "doge", name: "Dogecoin / DOGE", coin: "DOGE", path: "m/44'/3'/0'/0/{i}", kind: "p2pkh", p2pkh: 0x1e, wif: 0x9e, sign: "btc" },
    { id: "dash", name: "Dash / DASH", coin: "DASH", path: "m/44'/5'/0'/0/{i}", kind: "p2pkh", p2pkh: 0x4c, wif: 0xcc, sign: "btc" },
    { id: "bch_legacy", name: "Bitcoin Cash Legacy / BCH", coin: "BCH", path: "m/44'/145'/0'/0/{i}", kind: "p2pkh", p2pkh: 0x00, wif: 0x80, sign: "btc" },
    { id: "dgb", name: "DigiByte Native SegWit / DGB", coin: "DGB", path: "m/84'/20'/0'/0/{i}", kind: "bech32", hrp: "dgb", sign: "btc" },
    { id: "vtc", name: "Vertcoin Native SegWit / VTC", coin: "VTC", path: "m/84'/28'/0'/0/{i}", kind: "bech32", hrp: "vtc", sign: "btc" },
    { id: "rvn", name: "Ravencoin / RVN", coin: "RVN", path: "m/44'/175'/0'/0/{i}", kind: "p2pkh", p2pkh: 0x3c, wif: 0x80, sign: "btc" },
    { id: "qtum", name: "Qtum / QTUM", coin: "QTUM", path: "m/44'/2301'/0'/0/{i}", kind: "p2pkh", p2pkh: 0x3a, wif: 0x80, sign: "btc" },
    { id: "namecoin", name: "Namecoin / NMC", coin: "NMC", path: "m/44'/7'/0'/0/{i}", kind: "p2pkh", p2pkh: 0x34, wif: 0x80, sign: "btc" },
    { id: "peercoin", name: "Peercoin / PPC", coin: "PPC", path: "m/44'/6'/0'/0/{i}", kind: "p2pkh", p2pkh: 0x37, wif: 0xb7, sign: "btc" },
    { id: "viacoin", name: "Viacoin / VIA", coin: "VIA", path: "m/44'/14'/0'/0/{i}", kind: "p2pkh", p2pkh: 0x47, wif: 0xc7, sign: "btc" },
    { id: "reddcoin", name: "ReddCoin / RDD", coin: "RDD", path: "m/44'/4'/0'/0/{i}", kind: "p2pkh", p2pkh: 0x3d, wif: 0xbd, sign: "btc" },
    { id: "feathercoin", name: "Feathercoin / FTC", coin: "FTC", path: "m/44'/8'/0'/0/{i}", kind: "p2pkh", p2pkh: 0x0e, wif: 0x8e, sign: "btc" },
  ];
  function bytesToHex(bytes) {
    return Array.from(bytes, (b) => hex[b]).join("");
  }

  function hexToBytes(value) {
    const clean = value.replace(/^0x/i, "");
    if (clean.length % 2) throw new Error("hex 长度无效");
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    return bytes;
  }

  function concatBytes(...arrays) {
    const length = arrays.reduce((sum, item) => sum + item.length, 0);
    const out = new Uint8Array(length);
    let offset = 0;
    arrays.forEach((item) => {
      out.set(item, offset);
      offset += item.length;
    });
    return out;
  }

  function numberToBytes(value, length = 4) {
    const out = new Uint8Array(length);
    for (let i = length - 1; i >= 0; i -= 1) {
      out[i] = value & 0xff;
      value >>>= 8;
    }
    return out;
  }

  function bigintToBytes(value, length = 32) {
    const out = new Uint8Array(length);
    let current = value;
    for (let i = length - 1; i >= 0; i -= 1) {
      out[i] = Number(current & 0xffn);
      current >>= 8n;
    }
    return out;
  }

  function bytesToBigint(bytes) {
    return BigInt(`0x${bytesToHex(bytes) || "0"}`);
  }

  function mod(value, modulo = P) {
    const result = value % modulo;
    return result >= 0n ? result : result + modulo;
  }

  function invert(value, modulo = P) {
    if (value === 0n) throw new Error("无法反转 0");
    let a = mod(value, modulo);
    let b = modulo;
    let x = 0n;
    let y = 1n;
    let u = 1n;
    let v = 0n;
    while (a !== 0n) {
      const q = b / a;
      [x, u] = [u, x - u * q];
      [y, v] = [v, y - v * q];
      [b, a] = [a, b - a * q];
    }
    if (b !== 1n) throw new Error("反转失败");
    return mod(x, modulo);
  }

  function pointAdd(a, b) {
    if (!a) return b;
    if (!b) return a;
    if (a.x === b.x && a.y !== b.y) return null;
    const slope = a.x === b.x && a.y === b.y
      ? mod(3n * a.x * a.x * invert(2n * a.y))
      : mod((b.y - a.y) * invert(b.x - a.x));
    const x = mod(slope * slope - a.x - b.x);
    return { x, y: mod(slope * (a.x - x) - a.y) };
  }

  function pointMultiply(point, scalar) {
    let n = mod(scalar, N);
    let result = null;
    let addend = point;
    while (n > 0n) {
      if (n & 1n) result = pointAdd(result, addend);
      addend = pointAdd(addend, addend);
      n >>= 1n;
    }
    return result;
  }

  function publicKeyFromPrivate(privateKey, compressed = true) {
    const point = pointMultiply(G, bytesToBigint(privateKey));
    if (!point) throw new Error("无效私钥");
    if (!compressed) return concatBytes(new Uint8Array([4]), bigintToBytes(point.x), bigintToBytes(point.y));
    return concatBytes(new Uint8Array([point.y & 1n ? 3 : 2]), bigintToBytes(point.x));
  }

  async function sha256(bytes) {
    return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  }

  async function sha512(bytes) {
    return new Uint8Array(await crypto.subtle.digest("SHA-512", bytes));
  }

  async function hmacSha512(key, data) {
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
    return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, data));
  }

  async function mnemonicToSeed(mnemonic, passphrase = "") {
    const material = await crypto.subtle.importKey("raw", textEncoder.encode(mnemonic.normalize("NFKD")), "PBKDF2", false, ["deriveBits"]);
    const salt = textEncoder.encode(`mnemonic${passphrase.normalize("NFKD")}`);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-512", salt, iterations: 2048 }, material, 512));
  }

  async function masterKeyFromSeed(seed) {
    const digest = await hmacSha512(textEncoder.encode("Bitcoin seed"), seed);
    return { key: digest.slice(0, 32), chainCode: digest.slice(32) };
  }

  async function childKey(node, index) {
    const hardened = index >= HARDENED;
    const data = hardened
      ? concatBytes(new Uint8Array([0]), node.key, numberToBytes(index))
      : concatBytes(publicKeyFromPrivate(node.key), numberToBytes(index));
    const digest = await hmacSha512(node.chainCode, data);
    const tweak = bytesToBigint(digest.slice(0, 32));
    if (tweak >= N) throw new Error("派生失败，请换一个账户序号");
    const child = mod(tweak + bytesToBigint(node.key), N);
    if (child === 0n) throw new Error("派生出无效私钥，请换一个账户序号");
    return { key: bigintToBytes(child), chainCode: digest.slice(32) };
  }

  function parsePath(path, index) {
    return path.replace("{i}", String(index)).split("/").slice(1).map((part) => {
      const hardened = part.endsWith("'");
      const value = Number.parseInt(hardened ? part.slice(0, -1) : part, 10);
      if (!Number.isSafeInteger(value) || value < 0 || value >= HARDENED) throw new Error(`无效路径片段：${part}`);
      return hardened ? value + HARDENED : value;
    });
  }

  async function derivePath(seed, path, index) {
    let node = await masterKeyFromSeed(seed);
    for (const segment of parsePath(path, index)) node = await childKey(node, segment);
    return node.key;
  }

  const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  function base58(bytes) {
    let value = bytesToBigint(bytes);
    let output = "";
    while (value > 0n) {
      const modValue = value % 58n;
      output = BASE58[Number(modValue)] + output;
      value /= 58n;
    }
    for (const byte of bytes) {
      if (byte === 0) output = "1" + output;
      else break;
    }
    return output || "1";
  }

  async function base58Check(prefix, payload) {
    const data = concatBytes(new Uint8Array([prefix]), payload);
    const checksum = (await sha256(await sha256(data))).slice(0, 4);
    return base58(concatBytes(data, checksum));
  }

  const BECH32 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  function polymod(values) {
    let chk = 1;
    for (const value of values) {
      const top = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ value;
      [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3].forEach((gen, i) => {
        if ((top >> i) & 1) chk ^= gen;
      });
    }
    return chk;
  }

  function bech32Encode(hrp, words) {
    const prefix = [...hrp].map((char) => char.charCodeAt(0) >> 5).concat([0], [...hrp].map((char) => char.charCodeAt(0) & 31));
    const checksum = polymod(prefix.concat(words).concat([0, 0, 0, 0, 0, 0])) ^ 1;
    const combined = words.concat(Array.from({ length: 6 }, (_, i) => (checksum >> (5 * (5 - i))) & 31));
    return `${hrp}1${combined.map((word) => BECH32[word]).join("")}`;
  }

  function convertBits(data, from, to, pad = true) {
    let acc = 0;
    let bits = 0;
    const maxv = (1 << to) - 1;
    const ret = [];
    for (const value of data) {
      if (value < 0 || value >> from) throw new Error("无效 bech32 数据");
      acc = (acc << from) | value;
      bits += from;
      while (bits >= to) {
        bits -= to;
        ret.push((acc >> bits) & maxv);
      }
    }
    if (pad && bits) ret.push((acc << (to - bits)) & maxv);
    return ret;
  }

  function leftRotate(value, shift) {
    return ((value << shift) | (value >>> (32 - shift))) >>> 0;
  }

  function ripemd160(message) {
    const bytes = Array.from(message);
    const bitLength = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 0; i < 8; i += 1) bytes.push((bitLength / 2 ** (8 * i)) & 0xff);

    const zl = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13];
    const zr = [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11];
    const sl = [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6];
    const sr = [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11];
    let h0 = 0x67452301;
    let h1 = 0xefcdab89;
    let h2 = 0x98badcfe;
    let h3 = 0x10325476;
    let h4 = 0xc3d2e1f0;

    const f = (j, x, y, z) => (j < 16 ? x ^ y ^ z : j < 32 ? (x & y) | (~x & z) : j < 48 ? (x | ~y) ^ z : j < 64 ? (x & z) | (y & ~z) : x ^ (y | ~z));
    const kl = (j) => (j < 16 ? 0 : j < 32 ? 0x5a827999 : j < 48 ? 0x6ed9eba1 : j < 64 ? 0x8f1bbcdc : 0xa953fd4e);
    const kr = (j) => (j < 16 ? 0x50a28be6 : j < 32 ? 0x5c4dd124 : j < 48 ? 0x6d703ef3 : j < 64 ? 0x7a6d76e9 : 0);

    for (let offset = 0; offset < bytes.length; offset += 64) {
      const words = Array.from({ length: 16 }, (_, i) => bytes[offset + 4 * i] | (bytes[offset + 4 * i + 1] << 8) | (bytes[offset + 4 * i + 2] << 16) | (bytes[offset + 4 * i + 3] << 24));
      let al = h0; let bl = h1; let cl = h2; let dl = h3; let el = h4;
      let ar = h0; let br = h1; let cr = h2; let dr = h3; let er = h4;
      for (let j = 0; j < 80; j += 1) {
        let t = (leftRotate((al + f(j, bl, cl, dl) + words[zl[j]] + kl(j)) >>> 0, sl[j]) + el) >>> 0;
        al = el; el = dl; dl = leftRotate(cl, 10); cl = bl; bl = t;
        t = (leftRotate((ar + f(79 - j, br, cr, dr) + words[zr[j]] + kr(j)) >>> 0, sr[j]) + er) >>> 0;
        ar = er; er = dr; dr = leftRotate(cr, 10); cr = br; br = t;
      }
      const t = (h1 + cl + dr) >>> 0;
      h1 = (h2 + dl + er) >>> 0;
      h2 = (h3 + el + ar) >>> 0;
      h3 = (h4 + al + br) >>> 0;
      h4 = (h0 + bl + cr) >>> 0;
      h0 = t;
    }
    const out = new Uint8Array(20);
    [h0, h1, h2, h3, h4].forEach((word, i) => {
      out[i * 4] = word & 0xff;
      out[i * 4 + 1] = (word >>> 8) & 0xff;
      out[i * 4 + 2] = (word >>> 16) & 0xff;
      out[i * 4 + 3] = (word >>> 24) & 0xff;
    });
    return out;
  }

  async function hash160(bytes) {
    return ripemd160(await sha256(bytes));
  }

  function keccak256(bytes) {
    const RC = [1n, 0x8082n, 0x800000000000808an, 0x8000000080008000n, 0x808bn, 0x80000001n, 0x8000000080008081n, 0x8000000000008009n, 0x8an, 0x88n, 0x80008009n, 0x8000000an, 0x8000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n, 0x8000000000008002n, 0x8000000000000080n, 0x800an, 0x800000008000000an, 0x8000000080008081n, 0x8000000000008080n, 0x80000001n, 0x8000000080008008n];
    const ROT = [0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14];
    const MASK = (1n << 64n) - 1n;
    const state = Array(25).fill(0n);
    const rate = 136;
    const input = Array.from(bytes);
    input.push(0x01);
    while (input.length % rate !== rate - 1) input.push(0);
    input.push(0x80);
    const rotl = (x, n) => ((x << BigInt(n)) | (x >> BigInt(64 - n))) & MASK;

    for (let offset = 0; offset < input.length; offset += rate) {
      for (let i = 0; i < rate / 8; i += 1) {
        let lane = 0n;
        for (let j = 0; j < 8; j += 1) lane |= BigInt(input[offset + i * 8 + j]) << BigInt(8 * j);
        state[i] ^= lane;
      }
      for (let round = 0; round < 24; round += 1) {
        const c = Array.from({ length: 5 }, (_, x) => state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20]);
        const d = Array.from({ length: 5 }, (_, x) => c[(x + 4) % 5] ^ rotl(c[(x + 1) % 5], 1));
        for (let x = 0; x < 5; x += 1) for (let y = 0; y < 5; y += 1) state[x + 5 * y] ^= d[x];
        const b = Array(25);
        for (let x = 0; x < 5; x += 1) for (let y = 0; y < 5; y += 1) b[y + 5 * ((2 * x + 3 * y) % 5)] = rotl(state[x + 5 * y], ROT[x + 5 * y]);
        for (let x = 0; x < 5; x += 1) for (let y = 0; y < 5; y += 1) state[x + 5 * y] = b[x + 5 * y] ^ ((~b[((x + 1) % 5) + 5 * y]) & b[((x + 2) % 5) + 5 * y]);
        state[0] ^= RC[round];
      }
    }
    const out = new Uint8Array(32);
    for (let i = 0; i < 4; i += 1) {
      let lane = state[i];
      for (let j = 0; j < 8; j += 1) {
        out[i * 8 + j] = Number(lane & 0xffn);
        lane >>= 8n;
      }
    }
    return out;
  }

  function checksumAddress(addressBytes) {
    const lower = bytesToHex(addressBytes);
    const hash = bytesToHex(keccak256(textEncoder.encode(lower)));
    return `0x${lower.split("").map((char, i) => (Number.parseInt(hash[i], 16) >= 8 ? char.toUpperCase() : char)).join("")}`;
  }

  async function makeAddress(network, privateKey) {
    const compressedPublicKey = publicKeyFromPrivate(privateKey);
    const uncompressedPublicKey = publicKeyFromPrivate(privateKey, false);
    if (network.kind === "evm") {
      return checksumAddress(keccak256(uncompressedPublicKey.slice(1)).slice(-20));
    }
    const pubKeyHash = await hash160(compressedPublicKey);
    if (network.kind === "bech32") return bech32Encode(network.hrp, [0].concat(convertBits(pubKeyHash, 8, 5)));
    return base58Check(network.p2pkh, pubKeyHash);
  }

  async function wif(network, privateKey) {
    const prefix = network.wif ?? 0x80;
    return base58Check(prefix, concatBytes(privateKey, new Uint8Array([1])));
  }

  function normalizeMnemonic(value) {
    return value.normalize("NFKD").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function validateMnemonicShape(mnemonic) {
    const words = normalizeMnemonic(mnemonic).split(" ").filter(Boolean);
    if (![12, 15, 18, 21, 24].includes(words.length)) throw new Error("请输入 12、15、18、21 或 24 个助记词");
    if (!words.every((word) => /^[a-z]+$/.test(word))) throw new Error("当前离线派生器仅支持英文 BIP39 助记词");
    return words.join(" ");
  }

  async function deriveWallets(mnemonicInput, passphrase, startIndex, networkId = "btc", count = 36) {
    const mnemonic = validateMnemonicShape(mnemonicInput);
    const firstIndex = Number.parseInt(startIndex, 10);
    const total = Number.parseInt(count, 10);
    if (!Number.isSafeInteger(firstIndex) || firstIndex < 0 || firstIndex > 1000000) throw new Error("起始序号需要是 0 到 1000000 的整数");
    if (!Number.isSafeInteger(total) || total < 1 || total > 36) throw new Error("每次最多显示 36 个地址");
    const network = NETWORKS.find((item) => item.id === networkId);
    if (!network) throw new Error("请选择支持的货币 / 网络");
    const seed = await mnemonicToSeed(mnemonic, passphrase || "");
    const rows = [];
    for (let offset = 0; offset < total; offset += 1) {
      const index = firstIndex + offset;
      const privateKey = await derivePath(seed, network.path, index);
      const publicKey = publicKeyFromPrivate(privateKey);
      rows.push({
        ...network,
        index,
        path: network.path.replace("{i}", String(index)),
        address: await makeAddress(network, privateKey),
        privateKeyHex: bytesToHex(privateKey),
        publicKeyHex: bytesToHex(publicKey),
        wif: network.kind === "evm" ? "" : await wif(network, privateKey),
      });
    }
    return rows;
  }

  async function signMessage(privateKeyHex, message, mode = "evm") {
    const privateKey = hexToBytes(privateKeyHex);
    const messageBytes = textEncoder.encode(message);
    const digest = mode === "evm"
      ? keccak256(concatBytes(textEncoder.encode(`\x19Ethereum Signed Message:\n${messageBytes.length}`), messageBytes))
      : await sha256(await sha256(concatBytes(textEncoder.encode(`\x18Bitcoin Signed Message:\n`), new Uint8Array([messageBytes.length]), messageBytes)));
    const z = bytesToBigint(digest);
    let r = 0n; let s = 0n; let recovery = 0;
    while (r === 0n || s === 0n) {
      const random = new Uint8Array(32);
      crypto.getRandomValues(random);
      const k = mod(bytesToBigint(await sha256(concatBytes(random, privateKey, digest))), N - 1n) + 1n;
      const point = pointMultiply(G, k);
      r = mod(point.x, N);
      s = mod(invert(k, N) * (z + r * bytesToBigint(privateKey)), N);
      recovery = Number(point.y & 1n) | (point.x >= N ? 2 : 0);
      if (s > N / 2n) {
        s = N - s;
        recovery ^= 1;
      }
    }
    const signature = concatBytes(bigintToBytes(r), bigintToBytes(s));
    return {
      mode,
      hash: bytesToHex(digest),
      r: `0x${bigintToBytes(r).reduce((out, byte) => out + hex[byte], "")}`,
      s: `0x${bigintToBytes(s).reduce((out, byte) => out + hex[byte], "")}`,
      v: mode === "evm" ? 27 + recovery : recovery,
      signature: mode === "evm" ? `0x${bytesToHex(concatBytes(signature, new Uint8Array([27 + recovery])))}` : bytesToHex(signature),
    };
  }

  window.walletCore = { NETWORKS, deriveWallets, signMessage, normalizeMnemonic };
})();
