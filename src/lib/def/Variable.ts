import Big from 'big.js';
export const cppTypes = [
  'bool',
  'int',
  'unsigned',
  'long',
  'unsigned long',
  'float',
  'double',
] as const;

export type cppTypes = typeof cppTypes[number];

export const parseVar = (type: cppTypes, val: string): number => {
  switch (type) {
    case 'bool':
      return val === 'true' ? 1 : 0;
    case 'int':
    case 'unsigned':
    case 'long':
    case 'unsigned long':
    case 'float':
    case 'double':
      return Big(val).toNumber();
  }
};
export const stepVar = (type: cppTypes): number => {
  switch (type) {
    case 'bool':
    case 'int':
    case 'unsigned':
    case 'long':
    case 'unsigned long':
      return 1;
    case 'float':
    case 'double':
      return 1e-4;
  }
};

/**
 * 所有可变变量的描述
 */
export type VarDescriptions = {
  /**类型字符串 */
  types: Record<cppTypes, string>;
  /**所有变量 */
  vars: {
    group: string;
    type: string;
    name: string;
    def: string;
    min: string;
    max: string;
    key: string;
  }[];
};
