<script lang="ts">
  import ImgShowList from '$components/ImgShowList.svelte';
  import { cppTypes, parseVar, stepVar, type VarDescriptions } from '$def/Variable';
  import { flip } from '$helpers/common';
  import { getVar, setVar } from '$lib/api/vars';

  export let append_img: boolean; //附加图像
  export let desc: VarDescriptions;

  const types = flip(desc.types) as Record<string, cppTypes>; //类型字符串映射
  const vars = [...desc.vars].sort((l, r) => l.key.localeCompare(r.key)); //所有变量
  let values = vars.map((x) => parseVar(types[x.type], x.def)); //所有变量的值

  const delay = 100; //更新冷却
  let lstUpdate: number | null = null; //上一次更新 null为禁用更新
  const oldvalues = [...values]; //旧值
  $: if (values) update();
  /**值更新监听 (上传)*/
  async function update() {
    if (lstUpdate === null || Date.now() - lstUpdate < delay) return;
    lstUpdate = null;
    const ps = values.map(async (v, i) => {
      if (Math.abs(oldvalues[i] - v) < stepVar(types[vars[i].type])) return;
      const r = await setVar(vars[i].key, `${v}`);
      oldvalues[i] = values[i] = parseVar(types[vars[i].type], r);
    });
    await Promise.all(ps);
    values = values;
    lstUpdate = Date.now();
  }

  Promise.all(
    vars.map(async (v, i) => {
      const r = await getVar(v.key);
      oldvalues[i] = values[i] = parseVar(types[v.type], r);
      values = values;
    }),
  ).then(() => (lstUpdate = Date.now()));
</script>

<div class="row">
  <div class="col-{append_img ? 6 : 12}">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          {#if append_img}
            <th scope="col">组-名</th>
          {:else}
            <th scope="col">组</th>
            <th scope="col">名</th>
          {/if}
          <th scope="col">min</th>
          <th scope="col">max</th>
          <th scope="col">default</th>
          <th scope="col">值</th>
        </tr>
      </thead>
      <tbody>
        {#each vars as value, i}
          {@const type = types[value.type]}
          <tr class="align-middle">
            <th scope="row">{i + 1}</th>
            {#if append_img}
              <td>
                <span class="text-secondary fw-light"> {value.group}</span> <br />
                <span class="fw-bold"> {value.name}</span>
              </td>
            {:else}
              <td> {value.group} </td>
              <td> {value.name} </td>
            {/if}
            <td> {parseVar(type, value.min)} </td>
            <td> {parseVar(type, value.max)} </td>
            <td>
              {parseVar(type, value.def)} <br />
              <button
                type="button"
                class="btn btn-primary btn-sm"
                on:click={() => (values[i] = parseVar(type, value.def))}
              >
                重置
              </button>
            </td>
            <td>
              <input
                type="range"
                class="form-range"
                min={value.min}
                max={value.max}
                step={stepVar(type)}
                bind:value={values[i]}
              />
              <input type="text" bind:value={values[i]} />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if append_img}
    <div class="col-6">
      <ImgShowList />
    </div>
  {/if}
</div>
