<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import ErrorHero from '$components/ErrorHero.svelte';
  import LoadingHero from '$components/LoadingHero.svelte';
  import PlanPanel from '$components/PlanPanel.svelte';
  import { isNoBaseSettingError } from '$def/errors';
  import type { PlanInfo } from '$def/Task';
  import { toBaseSetting } from '$lib/api/paes';
  import { getTaskDescriptions } from '$lib/api/task';

  const infos: PlanInfo = {
    name: `Unnamed-${Date.now()}`,
    description: '',
    tasks: {},
  };
</script>

{#if browser}
  {#await getTaskDescriptions()}
    <LoadingHero />
  {:then description}
    <PlanPanel {description} {infos} />
  {:catch err}
    {#if isNoBaseSettingError(err)}
      {goto(toBaseSetting($page.url.pathname))}
    {:else}
      <ErrorHero description={err} />
    {/if}
  {/await}
{:else}
  <LoadingHero />
{/if}
