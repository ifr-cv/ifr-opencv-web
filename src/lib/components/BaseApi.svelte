<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { API_BASE_KEY, API_P_HTTP_KEY, API_P_WS_KEY } from '$def/common';

  export let go: string | undefined | null = '';

  /**基础api输入*/ let base_api_input: string =
    (browser && localStorage.getItem(API_BASE_KEY)) || '';
  $: baseApiUpdate(base_api_input);

  /**基础api输入是否有效*/ let base_api_input_valid: undefined | boolean;
  /**实际的基础api*/ let base_api = '';

  /**验证输入api地址是否有效*/
  function baseApiUpdate(val: string) {
    if (!val) {
      localStorage.setItem(API_BASE_KEY, (base_api = ''));
      base_api_input_valid = undefined;
    } else {
      if (val.startsWith('//')) val = `http:${val}`;
      if (val.includes('://')) {
        const i = val.indexOf('://');
        if (!/[0-9a-z]+/i.test(val.substring(0, i))) {
          base_api = '';
          base_api_input_valid = false; //协议有非法字符
          return;
        }
      } else val = `http://${val}`;
      try {
        const url = new URL(val);
        if (!url.origin.includes('://')) throw 1;
        base_api = url.origin.substring(url.origin.indexOf('://') + 3);
        localStorage.setItem(API_BASE_KEY, base_api);
        base_api_input_valid = true;
        return;
      } catch {
        localStorage.setItem(API_BASE_KEY, (base_api = ''));
        base_api_input_valid = false; //无效url
        return;
      }
    }
  }

  let base_p_http: string | undefined =
    (browser && localStorage.getItem(API_P_HTTP_KEY)) || undefined;
  let base_p_ws: string | undefined = (browser && localStorage.getItem(API_P_WS_KEY)) || undefined;
  $: save(base_p_http, API_P_HTTP_KEY);
  $: save(base_p_ws, API_P_WS_KEY);

  function save(val: string | undefined, key: string) {
    if (browser && localStorage && val !== undefined) localStorage.setItem(key, val);
  }
</script>

<div class="form-floating mb-3">
  <input
    type="text"
    class="form-control"
    id="base_api_input"
    placeholder="设备地址"
    class:is-valid={base_api_input_valid === true}
    class:is-invalid={base_api_input_valid === false}
    bind:value={base_api_input}
  />
  <label for="base_api_input">设备地址</label>
</div>

<div class="row g-2">
  <div class="col-md">
    <div class="form-floating">
      <select class="form-select" id="base_p_http" bind:value={base_p_http}>
        <option selected value="http://">http</option>
        <option value="https://">https</option>
      </select>
      <label for="base_p_http">http协议</label>
    </div>
  </div>
  <div class="col-md">
    <div class="form-floating">
      <select class="form-select" id="base_p_ws" bind:value={base_p_ws}>
        <option selected value="ws://">ws</option>
        <option selected value="wss://">wss</option>
      </select>
      <label for="base_p_ws">Websocket协议</label>
    </div>
  </div>
</div>
{#if go}
  <button
    class="w-100 btn btn-lg btn-primary"
    type="submit"
    on:click={() => go && goto(go)}
    disabled={!base_api_input_valid}
  >
    开始使用
  </button>
{/if}

<hr class="my-4" />
<small class="text-muted">
  通过指定设备地址连接到设备, 设备地址形如: "127.0.0.1" / "example.com" / "//example.com" 等url形态,
  较强兼容性
</small>
<br />
<small class="text-muted">
  当前值: {base_api_input_valid && base_api ? base_api : '无效'}
</small>
