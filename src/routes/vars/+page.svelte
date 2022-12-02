<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import ErrorHero from '$components/ErrorHero.svelte';
  import LoadingHero from '$components/LoadingHero.svelte';
  import { API_BASE_KEY, API_VARS_SHOW_DETAIL, API_VARS_SHOW_IMG } from '$def/common';
  import { isNoBaseSettingError } from '$def/errors';
  import { loadStorage, saveStorage } from '$def/LocalStorge';
  import { toBaseSetting } from '$lib/api/paes';
  import { getVarsDescriptions, isVarsEnable } from '$lib/api/vars';
  import DetailPage from './DetailPage.svelte';
  import ListPage from './ListPage.svelte';

  let detail: boolean = loadStorage(API_VARS_SHOW_DETAIL, true);
  $: saveStorage(API_VARS_SHOW_DETAIL, detail);
  let append_img: boolean = loadStorage(API_VARS_SHOW_IMG, false);
  $: saveStorage(API_VARS_SHOW_IMG, append_img);
</script>

{#if browser}
  {#await isVarsEnable()}
    <LoadingHero />
  {:then enable}
    {#if enable}
      {#await getVarsDescriptions()}
        <LoadingHero />
      {:then desc}
        <div class="box">
          <div class="row">
            <div class="col-6 col-md-4">
              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="switch_detail"
                  bind:checked={detail}
                />
                <label class="form-check-label" for="switch_detail">显示详细变量信息</label>
              </div>
            </div>
            {#if !detail}
              <div class="col-6 col-md-4">
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="switch_img"
                    bind:checked={append_img}
                  />
                  <label class="form-check-label" for="switch_img">附加图像</label>
                </div>
              </div>
            {/if}
          </div>
          {#if detail}
            <DetailPage {desc} />
          {:else}
            <ListPage {desc} {append_img} />
          {/if}
        </div>
      {/await}
    {:else}
      <ErrorHero title="未启用">
        此设备未启用网页调参功能(可能由于C++标准低于C++17)<br />
        设备: {localStorage.getItem(API_BASE_KEY)}
      </ErrorHero>
    {/if}
  {:catch err}
    {#if isNoBaseSettingError(err)}
      {goto(toBaseSetting($page.url.pathname))}
    {:else}
      <ErrorHero description={err} />
    {/if}
  {/await}
{/if}

<style>
  .box {
    margin: 2vh 4vw;
  }
</style>
