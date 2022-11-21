/**
 * 一个IO信息
 */
export type TaskIOInfo = {
  /**此IO使用的频道名 */
  channel: string;
};
/**
 * 一个任务的数据
 */
export type TaskInfo = {
  /**是否启用 */
  enable: boolean;
  io: {
    /**IO名 */
    [k in string]: TaskIOInfo;
  };
  args: {
    /**参数名 */
    [k in string]: string;
  };
};
/**
 * 流程信息
 */
export type PlanInfo = {
  /**流程名称 */
  name: string;
  /**流程说明 */
  description: string;
  /**所有任务 */
  tasks: {
    /**任务名 */
    [k in string]: TaskInfo;
  };
};

/**
 * 流程状态信息
 */
export type PlanState = {
  /**当前选中的流程 */
  current: string;
  /**选中的流程是否在运行 */
  running: boolean;
  /**当前流程状态id */
  state: number;
};

/**
 * 一个IO信息
 */
export type TaskIODescription = {
  /**此IO的名称 */
  [k in string]: {
    /**此IO的类型 */
    type: string;
    /**此IO说明 */
    description: string;
    /** true: Input / false: Output */
    isIn: boolean;
  };
};

/**任务参数的类型*/
export enum TaskArgType {
  STR,
  NUMBER,
  BOOL,
}
/**
 * 一个参数信息
 */
export type TaskArgDescription = {
  /**此参数的名称 */
  [k in string]: {
    /**此参数的说明 */
    description: string;
    /**此参数默认值 */
    defaultValue: string;
    /**此参数的类型enum */
    type: TaskArgType;
  };
};
/**
 * 单个任务的描述信息
 */
export type TaskDescription = {
  /**任务所属的组别 */
  group: string;
  /**任务说明 */
  description: string;
  /**任务的IO*/
  io: TaskIODescription;
  /**任务的参数*/
  args: TaskArgDescription;
};
/**
 * 全部任务的描述信息
 */
export type TaskDescriptions = {
  /**任务名 */
  [k in string]: TaskDescription;
};

/**状态描述 */
export const stateInfo: Record<number, string> = {
  0: '等待阶段',
  1: '初始化阶段',
  2: '运行阶段',
  3: '停止阶段',
  4: '清理阶段',
} as const;

/**流程名称正则表达式 */
export const planNameRegex = /^[a-zA-Z][0-9a-zA-Z_-]*$/;

/**
 * 依据描述生成空的task信息
 * @param description
 */
export function FillTaskBlank(description: TaskDescription, ti?: TaskInfo): TaskInfo {
  if (!ti) ti = { enable: false, io: {}, args: {} };
  ti.enable = !!ti.enable;
  const io: typeof ti['io'] = {};
  for (const ioname in description.io) {
    io[ioname] = ti.io[ioname] || { channel: description.io[ioname].type };
    io[ioname].channel = io[ioname].channel || description.io[ioname].type;
  }
  ti.io = io;

  const args: typeof ti['args'] = {};
  for (const argname in description.args) {
    args[argname] =
      (ti.args[argname] === undefined
        ? GetTaskArgTypeDefault(description.args[argname].type)
        : ti.args[argname]) + '';
  }
  ti.args = args;

  return ti;
}

export function GetTaskArgTypeDefault(type: TaskArgType) {
  let v: string = '';
  switch (type) {
    case TaskArgType.STR:
      v += '';
      break;
    case TaskArgType.NUMBER:
      v += 0;
      break;
    case TaskArgType.BOOL:
      v += false;
      break;
  }
  return v;
}
