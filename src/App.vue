<template>
  <div id="app" class="body">
    <header>
        <div class="container full grid">
            <div class="logo">
              <router-link :to="{name: 'myprojects'}">
                <img src="@/assets/img/logo.svg" />
              </router-link>
            </div>
            <div class="top-menu">
                <locale-switcher />
                <router-link :to="{name: 'myprojects'}" class="btn-top"><span>{{$t('myProjects')}}</span><i class="material-icons">layers</i></router-link>
                <a target="_blank" href="https://www.transapp.cl" class="btn-top"><span>{{ $t('website') }}</span><i class="material-icons">public</i></a>
                <a target="_blank" href="https://www.transapp.cl/servicios-transapp/#contacto" class="btn-top"><span>{{ $t('contact') }}</span><i class="material-icons">mail</i></a>
            </div>
        </div>
    </header>
    <div class="supercontent">
        <div class="container">
            <Breadcrumbs></Breadcrumbs>
        </div>
        <router-view/>
    </div>
  </div>
</template>

<style scoped>


@import "../node_modules/material-icons/css/material-icons.css";
@import "./assets/css/base.css";
@import "./assets/css/style.css";
@import "./assets/css/temp.css";
@import "../node_modules/select2/dist/css/select2.min.css";
@import url("https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css");
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap");

</style>

<script>
import LocaleSwitcher from './components/LocaleSwitcher'

require('material-icons')

export default {
  name: 'App',
  components: {
    LocaleSwitcher
  }
}
</script>>
