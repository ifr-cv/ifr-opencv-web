<script lang="ts">
  export let path: string;
  export let paths: string[];
</script>

<figure class="figure w-100 shadow-sm">
  {#if path}
    <img src="..." class="figure-img img-fluid rounded" alt="..." />
  {/if}
  <figcaption class="figure-caption">
    <div class="dropdown">
      <button
        class="btn btn-secondary dropdown-toggle"
        type="button"
        id="dropdownMenuButton1"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {path}
      </button>
      <ul class="dropdown-menu">
        {#each paths as p}
          <li><span class="dropdown-item" on:click={() => (path = p)}>{p}</span></li>
        {/each}
      </ul>
    </div>
  </figcaption>
</figure>

<style lang="scss">
</style>
