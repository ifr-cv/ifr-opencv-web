<script lang="ts">
  import Spinner from '$components/Spinner.svelte';
  import { cppTypes, parseVar, stepVar, type VarDescriptions } from '$def/Variable';
  import { flip } from '$helpers/common';
  import { getVar, setVar } from '$lib/api/vars';

  export let selected_group: string;
  export let selected_name: string;
  export let desc: VarDescriptions;

  const types = flip(desc.types) as Record<string, cppTypes>;

  $: value = desc && desc.vars.find((x) => x.group === selected_group && x.name === selected_name);
  $: type = value && types[value.type]; //C++类型字符串
  let val: number | undefined, old_val: number | undefined; //值 旧值

  $: if (selected_group && selected_name) resetVar();

  const delay = 100; //更新冷却
  let lstUpdate: number | null = null; //上一次更新 null为禁用更新
  $: updateVar(old_val, val);

  /**更新(上传)var*/
  async function updateVar(old_val: number | undefined, val: number | undefined) {
    if (old_val === undefined || val === undefined || !value || !type) return;
    if (lstUpdate === null || Date.now() - lstUpdate < delay) return;
    if (Math.abs(old_val - val) < stepVar(type)) return;
    lstUpdate = null;
    old_val = val = parseVar(type, await setVar(value.key, `${val}`));
    lstUpdate = Date.now();
  }
  /**重置var*/
  async function resetVar() {
    lstUpdate = null;
    val = undefined;
    if (value && type) {
      old_val = val = parseVar(type, await getVar(value.key));
      lstUpdate = Date.now();
    }
  }
</script>

{#if type && value}
  变量: <span class="fs-2 text-secondary">{value.group}</span> <span class="fs-5">::</span>
  <span class="fs-2">{value.name}</span><br />
  可编辑:
  <span class="fs-5" class:text-success={value.editable} class:text-danger={!value.editable}>
    {value.editable ? '是' : '否'}
  </span><br />
  类型:
  <span class="fs-5 text-nowrap overflow-hidden">
    {#if types[value.type]}
      <span>{types[value.type]}</span>
      {#if types[value.type] != value.type}
        <span class="text-secondary">({value.type})</span>
      {/if}
    {:else}<span>{value.type}</span>{/if}
  </span><br />
  最小值: <span class="fs-5 text-nowarp">{parseVar(type, value.min)}</span>
  <button
    type="button"
    class="btn btn-primary btn-sm"
    on:click={() => {
      if (value && type) val = parseVar(type, value.min);
    }}
  >
    设置
  </button> <br />
  默认值: <span class="fs-5 text-nowarp">{parseVar(type, value.def)}</span>
  <button
    type="button"
    class="btn btn-primary btn-sm"
    on:click={() => {
      if (value && type) val = parseVar(type, value.def);
    }}
  >
    重置
  </button>
  <br />
  最小值: <span class="fs-5 text-nowarp">{parseVar(type, value.max)}</span>
  <button
    type="button"
    class="btn btn-primary btn-sm"
    on:click={() => {
      if (value && type) val = parseVar(type, value.max);
    }}
  >
    设置
  </button> <br />
  当前值:
  <span class="fs-5 text-nowarp">
    {#if val === undefined}
      <Spinner sm /> Loading...
    {:else}
      {val}
    {/if}
  </span><br />
  <hr />
  {#if val !== undefined}
    <input
      type="range"
      class="form-range"
      min={value.min}
      max={value.max}
      step={stepVar(type)}
      bind:value={val}
      disabled={!value.editable}
    />
    <input type="text" class="w-100" bind:value={val} disabled={!value.editable} />
  {/if}
{/if}

<style lang="scss">
</style>
