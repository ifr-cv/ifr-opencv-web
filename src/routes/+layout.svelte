<script lang="ts">
  import 'bootstrap/dist/css/bootstrap.min.css';
  import Menu from '$components/Menu.svelte';
  import '../app.css';
  import { onMount } from 'svelte';
  import { delay } from '$helpers/common';
  import { fly } from 'svelte/transition';
  import Footer from '$components/Footer.svelte';
  onMount(() => import('bootstrap'));
</script>

<div class="box">
  <Menu />

  {#await delay() then}
    <main in:fly={{ y: 100 }}>
      <slot />
    </main>
  {/await}
</div>

<Footer />

<style>
  .box {
    min-height: 100vh;
  }
</style>
