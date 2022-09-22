<script lang="ts">
  import { page } from '$app/stores';
  import ErrorHero from '$components/ErrorHero.svelte';
</script>

<ErrorHero title={$page.status} description={$page.error?.message} />
