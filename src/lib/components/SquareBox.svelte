<div class="box">
  <div class="content">
    <slot />
  </div>
</div>

<style>
  .box {
    width: 100%;
    position: relative;
    height: 0;
    font-size: 0;
    line-height: 0;
    padding: 100% 0 0;
  }
  .content {
    top: 0;
    left: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    font-size: 1rem;
    line-height: 1rem;
  }
</style>
