<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { WEB_NAME } from '$def/common';
  import { keys } from '$helpers/common';
  import { listPlanInfo } from '$lib/api/task';

  let data: Record<
    string,
    { href: string; name: string; extra?: ({ href: string; name: string; r?: RegExp } | null)[] }
  > = {
    base: { href: '/base-setting', name: '基础' },
    task: {
      href: '/plans',
      name: '流程',
      extra: [
        { href: '/plans', r: /^\/plans$/, name: '流程列表' },
        { href: '/plans/new', name: '新建流程' },
      ],
    },
    info: { href: '/info', name: '信息' },
    api: { href: '/api', name: '后端接口' },
  };
  const isNow = (href: string, r: RegExp | undefined, page: typeof $page) =>
    r ? r.test(page.url.pathname) : page.url.pathname.startsWith(href);

  if (browser) {
    try {
      listPlanInfo().then((list) => {
        data.task.extra?.push(...list.map((name) => ({ href: `/plans/edit/${name}`, name })));
        data = data;
      });
    } catch (err) {}
  }
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="/">HOME</a>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon" />
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        {#each keys(data) as key (key)}
          {@const { href, name, extra } = data[key]}
          {#if extra}
            {@const id = `menu_element_${key}`}
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                class:active={isNow(href, undefined, $page)}
                {href}
                {id}
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {name}
              </a>
              <ul class="dropdown-menu" aria-labelledby={id}>
                {#each Object.values(extra) as sub}
                  {#if sub}
                    <li>
                      <a
                        class="dropdown-item"
                        class:active={isNow(sub.href, sub.r, $page)}
                        href={sub.href}
                      >
                        {sub.name}
                      </a>
                    </li>
                  {:else}
                    <li><hr class="dropdown-divider" /></li>
                  {/if}
                {/each}
              </ul>
            </li>
          {:else}
            <li class="nav-item">
              <a class="nav-link" class:active={isNow(href, undefined, $page)} {href}>{name}</a>
            </li>
          {/if}
        {/each}
      </ul>
      <span class="d-flex title">
        {WEB_NAME}
      </span>
    </div>
  </div>
</nav>

<style lang="scss">
  .title {
    font-weight: bold;
  }
  .nav-link {
    border-bottom: 1px solid #fff;
    transition: border-bottom 0.3s;
    &.active {
      border-bottom: 1px solid #000;
    }
  }
</style>
