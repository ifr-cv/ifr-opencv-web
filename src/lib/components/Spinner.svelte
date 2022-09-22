<script lang="ts">
  let className = '';
  export { className as class };
  export let type: 'border' | 'grow' = 'border';
  export let sm = false;

  export let size: string | undefined = undefined;
</script>

<span
  class="spinner spinner-{type} {sm ? `spinner-${type}-sm` : ''} {className}"
  style:width={size || undefined}
  style:height={size || undefined}
  role="status"
/>
