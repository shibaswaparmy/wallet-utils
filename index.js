const arg = require('arg')
const bip39 = require('bip39')
const { Wallet } = require('ethers')
const readlineSync = require('readline-sync')

const args = arg({
  // Types
  '--help': Boolean,
  '--strength': Number,
  '--get': Boolean,

  // Aliases
  '-h': '--help',
  '-s': '--strength',
  '-g': '--get',
})

const generate = async (strength = 128) => {
  const mnemonic = bip39.generateMnemonic(strength)

  return getWallet( mnemonic, 0)
}

const help = async () => {
  return `
Generate a new bip39 mnemonic and wallet, or get details for an existing mnemonic

Usage:
------

  ./wallet-utils [opts]
  
Options:
--------

  -h, --help             : display this help message
  -s NUM, --strength NUM : mnemonic strength. Default 128 (12 words). 256 = 24 words.
  -g, --get              : get private key and wallet details for specified mnemonic 
                           and HD wallet path. This will prompt for the mnemonic, and
                           the array index of the desired HD wallet path.

Examples:
---------

  Generate a 12 word mnemonic wallet:
    ./wallet-utils
  
  Generate a 24 word mnemonic wallet:
    ./wallet-utils -s 256
    ./wallet-utils --strength 256
  
  Get wallet details for given mnemonic at index 1:
    ./wallet-utils -g
    ./wallet-utils --get
      Mnemonic      : ***************
      HD Wallet Idx : 1

`
}

const getWallet = async(mnemonic, hdIdx = 0) => {
  const path = `m/44'/60'/0'/0/${hdIdx}`
  const wallet = Wallet.fromMnemonic(mnemonic, path)

  return {
    mnemonic,
    path,
    private_key: wallet.privateKey,
    public_key: wallet.publicKey,
    public_key_no_0x04_prefix: wallet.publicKey.replace('0x04', '0x'),
    address: wallet.address,
  }
}

const readFromStdIn = () => {
  const mnemonic = readlineSync.question('Mnemonic      : ', {
    hideEchoBack: true // The typed text on screen is hidden by `*` (default).
  })

  const hdIdx = readlineSync.question('HD Wallet Idx : ')

  return {
    mnemonic,
    hdIdx
  }
}

const run = async () => {
  let wallet;

  if(args['--help']) {
    return help()
  }

  if(args['--get']) {
    const input = readFromStdIn()
    wallet = await getWallet(input.mnemonic, input.hdIdx)
    return JSON.stringify(wallet, null, 2)
  }

  let strength = 128

  if (args['--strength'] > 0) {
    strength = args['--strength']
  }

  wallet = await generate(strength)
  return JSON.stringify(wallet, null, 2)
}

run().then(console.log).catch(console.log)
