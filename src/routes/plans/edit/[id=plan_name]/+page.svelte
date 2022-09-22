<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import ErrorHero from '$components/ErrorHero.svelte';
  import LoadingHero from '$components/LoadingHero.svelte';
  import PlanPanel from '$components/PlanPanel.svelte';
  import { isNoBaseSettingError } from '$def/errors';
  import type { PlanInfo, TaskDescriptions } from '$def/Task';
  import { toBaseSetting } from '$lib/api/paes';
  import { getPlanInfo, getTaskDescriptions } from '$lib/api/task';

  const name = $page.params.id;

  async function load(): Promise<[TaskDescriptions, PlanInfo | null]> {
    return [await getTaskDescriptions(), await getPlanInfo(name)];
  }
</script>

{#if browser}
  {#await load()}
    <LoadingHero />
  {:then [description, infos]}
    {#if infos}
      <PlanPanel {description} {infos} oldName={name} />
    {:else}
      <ErrorHero title="404" description="Not Found Plan: {name}" />
    {/if}
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
