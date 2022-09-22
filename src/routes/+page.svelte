<script lang="ts">
  import BaseApi from '$components/BaseApi.svelte';
  import { WEB_NAME } from '$def/common';
</script>

<div class="container col-xl-10 col-xxl-8 px-4 py-5 my-5">
  <div class="row align-items-center g-lg-5 py-5 rounded-3 border shadow-lg">
    <div class="col-lg-7 text-center text-lg-start">
      <h1 class="display-4 fw-bold lh-1 mb-3">{WEB_NAME}</h1>
      <p class="col-lg-10 fs-4">
        IFR 实验室智能感知组调试终端, 用于模块化部署任务流程、调试参数和监控程序及设备运行状态。
      </p>
    </div>
    <div class="col-md-10 mx-auto col-lg-5">
      <form class="p-4 p-md-5 border rounded-3 bg-light">
        <small class="text-muted"> 基础设置 </small>
        <BaseApi />
      </form>
    </div>
  </div>
</div>
