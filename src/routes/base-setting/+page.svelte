<script lang="ts">
  import { page } from '$app/stores';
  import BaseApi from '$components/BaseApi.svelte';
  import IconSetting from '$components/icons/IconSetting.svelte';
</script>

<main class="text-center">
  <form>
    <IconSetting width="72" height="57" />

    <h1 class="h3 mb-3 fw-normal">请配置基础内容</h1>

    <BaseApi go={$page.url.searchParams.get('go')} />
  </form>
</main>

<style>
  main {
    width: 100vw;
    max-height: 700px;
    max-width: 500px;
    padding: 15px;
    margin: auto;
    margin-top: 15vh;

    align-items: center;
  }
</style>
