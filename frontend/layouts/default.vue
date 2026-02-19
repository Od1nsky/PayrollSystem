<template>
  <div>
    <v-app-bar color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>Учёт заработной платы</v-toolbar-title>
      <v-spacer />
      <v-btn variant="text" to="/profile">
        <v-icon start>mdi-account</v-icon>
        {{ user?.name || 'Профиль' }}
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" :rail="rail" permanent @click="rail = false">
      <v-list nav>
        <v-list-item
          to="/"
          prepend-icon="mdi-home"
          title="Главная"
          value="home"
        />
        <v-list-item
          to="/employees"
          prepend-icon="mdi-account-group"
          title="Сотрудники"
          value="employees"
        />
        <v-list-item
          to="/accruals"
          prepend-icon="mdi-cash-plus"
          title="Начисления"
          value="accruals"
        />
        <v-list-item
          to="/deductions"
          prepend-icon="mdi-cash-minus"
          title="Удержания"
          value="deductions"
        />
        <v-list-item
          to="/payroll"
          prepend-icon="mdi-file-document-outline"
          title="Ведомости"
          value="payroll"
        />
        <v-list-item
          to="/reports"
          prepend-icon="mdi-chart-bar"
          title="Отчёты"
          value="reports"
        />
        <v-list-item
          v-if="user?.role === 'admin'"
          to="/users"
          prepend-icon="mdi-shield-account"
          title="Пользователи"
          value="users"
        />
      </v-list>

      <template #append>
        <v-list nav>
          <v-list-item
            prepend-icon="mdi-logout"
            title="Выход"
            value="logout"
            @click="handleLogout"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </div>
</template>

<script setup lang="ts">
const drawer = ref(true)
const rail = ref(false)
const { user, logout } = useAuth()
const router = useRouter()

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>
