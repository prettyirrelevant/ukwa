import { defineChain, getAddress} from 'viem';

export const WngnAbi = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'allowance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'needed',
      },
    ],
    name: 'ERC20InsufficientAllowance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: 'sender',
      },
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'needed',
      },
    ],
    name: 'ERC20InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'approver',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidApprover',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidReceiver',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: 'sender',
      },
    ],
    name: 'ERC20InvalidSender',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidSpender',
    type: 'error',
  },
  {
    name: 'EnforcedPause',
    type: 'error',
    inputs: [],
  },
  {
    name: 'ExpectedPause',
    type: 'error',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: 'owner',
      },
    ],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        indexed: true,
        name: 'owner',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
        name: 'value',
      },
    ],
    anonymous: false,
    name: 'Approval',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
        indexed: false,
      },
    ],
    anonymous: false,
    name: 'Paused',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        indexed: true,
        name: 'from',
      },
      {
        internalType: 'address',
        type: 'address',
        indexed: true,
        name: 'to',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
        name: 'value',
      },
    ],
    anonymous: false,
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
        indexed: false,
      },
    ],
    anonymous: false,
    name: 'Unpaused',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: 'owner',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'allowance',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'value',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        type: 'bool',
        name: '',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'approve',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'balanceOf',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'value',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'burn',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'value',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'burnFrom',
    type: 'function',
    outputs: [],
  },
  {
    outputs: [
      {
        internalType: 'uint8',
        type: 'uint8',
        name: '',
      },
    ],
    stateMutability: 'pure',
    name: 'decimals',
    type: 'function',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: 'to',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'amount',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'mint',
    outputs: [],
  },
  {
    outputs: [
      {
        internalType: 'string',
        type: 'string',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'name',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'address',
        type: 'address',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'owner',
    inputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'pause',
    outputs: [],
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'bool',
        type: 'bool',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'paused',
    inputs: [],
  },
  {
    stateMutability: 'nonpayable',
    name: 'renounceOwnership',
    type: 'function',
    outputs: [],
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'string',
        type: 'string',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'symbol',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'totalSupply',
    type: 'function',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: 'to',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'value',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        type: 'bool',
        name: '',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'transfer',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: 'from',
      },
      {
        internalType: 'address',
        type: 'address',
        name: 'to',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'value',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        type: 'bool',
        name: '',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'transferFrom',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'transferOwnership',
    type: 'function',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'unpause',
    outputs: [],
    inputs: [],
  },
] as const;

// https://sepolia.scrollscan.com/address/0xAF97c3478ABF6EEAc933d3383B71668F314400aA
export const WngnInitBlock = 4117692n;

export const WngnAddress = getAddress('0xAF97c3478ABF6EEAc933d3383B71668F314400aA');

export const scrollSepoliaAnkr = defineChain({
  blockExplorers: {
    default: {
      apiUrl: 'https://sepolia-blockscout.scroll.io/api',
      url: 'https://sepolia-blockscout.scroll.io',
      name: 'Blockscout',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 9473,
    },
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/scroll_sepolia_testnet'],
    },
  },
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  name: 'Scroll Sepolia',
  id: 534_351,
})
