<script lang="ts">
  import ImgShow from './ImgShow.svelte';

  export let amount = 2;
  let paths: string[] = [];
  $: fill(amount);

  function fill(amount: number) {
    if (amount > paths.length) paths = [...paths, ...Array(amount - paths.length).fill('')];
  }
</script>

{#each Array(amount).fill(0) as _, i (i)}
  <ImgShow bind:path={paths[i]} paths={['TODO']} />
{/each}
