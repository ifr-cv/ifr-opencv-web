<script lang="ts">
  import { WEB_NAME } from '$def/common';

  const links: { name: string; href: string }[] = [
    { name: 'Home', href: '/' },
    {
      name: 'Github',
      href: 'https://github.com/MineYuanlu/ifr-opencv-web',
    },
    {
      name: 'Project',
      href: 'https://github.com/MineYuanlu/ifr-opencv',
    },
  ];
</script>

<div class="container">
  <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
    <ul class="list-unstyled small text-muted">
      <li class="mb-2">
        网站设计: <a href="https://github.com/MineYuanlu" target="_blank">yuanlu</a>
      </li>
      <li class="mb-2">
        Code licensed
        <a
          href="https://github.com/MineYuanlu/ifr-opencv-web/blob/master/LICENSE"
          target="_blank"
          rel="license noopener">AGPL-3.0</a
        >, docs
        <a
          href="https://creativecommons.org/licenses/by/3.0/"
          target="_blank"
          rel="license noopener">CC BY 3.0</a
        >.
      </li>
      <li class="mb-2">Copyright &copy; 2022 yuanlu , DreamTeam</li>
    </ul>

    <div class="web-name">
      {WEB_NAME}
    </div>

    <ul class="nav col-md-4 justify-content-end">
      {#each links as { name, href }}
        <li class="nav-item">
          <a
            target={href.startsWith('/') ? undefined : '_blank'}
            {href}
            class="nav-link px-2 text-muted">{name}</a
          >
        </li>
      {/each}
    </ul>
  </footer>
</div>

<style lang="scss">
  footer {
    position: relative;
    * {
      position: relative;
    }
    .web-name {
      position: absolute;
      width: 100%;
      left: 0;
      text-align: center;
      z-index: -1;
    }
  }
</style>
