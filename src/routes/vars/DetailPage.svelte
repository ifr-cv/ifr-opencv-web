<script lang="ts">
  import type { VarDescriptions } from '$def/Variable';
  import DetailVariable from './DetailVariable.svelte';

  export let desc: VarDescriptions;
  let selected_group: string = '';
  let selected_name: string = '';

  selected_group = desc.vars[0]?.group;
  selected_name = getVars(desc)[0]?.name;

  function getVars(desc: VarDescriptions): VarDescriptions['vars'] {
    return desc.vars.filter((x) => x.group == selected_group);
  }
  function getGroups(desc: VarDescriptions) {
    return Array.from(new Set(desc.vars.map((x) => x.group)));
  }
</script>

<div class="row">
  <div class="col-12 col-md-2">
    <ul class="list-group">
      {#each getGroups(desc) as g}
        <li
          class="list-group-item"
          class:active={g === selected_group}
          on:click={() => ((selected_group = g), (selected_name = getVars(desc)[0]?.name))}
        >
          {g}
        </li>
      {:else}
        <li class="list-group-item">无变量</li>
      {/each}
    </ul>
  </div>

  <div class="col-12 col-md-2">
    <ul class="list-group">
      {#each getVars(desc) as vars}
        <li
          class="list-group-item"
          class:active={vars.name === selected_name}
          on:click={() => (selected_name = vars.name)}
        >
          {vars.name}
        </li>
      {:else}
        <li class="list-group-item">无变量</li>
      {/each}
    </ul>
  </div>

  <div class="col-12 col-md-8">
    <DetailVariable {desc} {selected_group} {selected_name} />
  </div>
</div>

<style lang="scss">
  li.list-group-item {
    cursor: pointer;
    &:not(.active):hover {
      background-color: rgba($color: #000000, $alpha: 0.05);
    }
  }
</style>
