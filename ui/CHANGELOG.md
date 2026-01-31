# Changelog

Todos los cambios notables de este proyecto serán documentados aquí.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.2.0] - 2026-01-17

### Added
- **Gráficos Interactivos con Recharts**:
  - `PriceLineChart` - Gráfico de área con historial de precios
  - `ExchangeComparison` - Gráfico de barras comparando exchanges
- **Página Charts completa**:
  - Selector de período de tiempo (1H, 24H, 7D, 30D, 1Y)
  - Métricas de precios máximo/mínimo del período
  - Indicador de volatilidad
  - Comparación visual entre exchanges
  - Resumen de mercado con spread de arbitraje
- **Página Alerts funcional**:
  - Formulario para crear nuevas alertas
  - Tipos: Price Above, Price Below, % Change
  - Gestión de alertas (activar/desactivar/eliminar)
  - Referencia de precio actual

### Changed
- Dashboard ahora usa `PriceLineChart` en lugar del placeholder
- Tabs de período de tiempo ahora son interactivos en Dashboard

## [0.1.0] - 2026-01-17

### Added
- Inicialización del proyecto con React 18 + Vite
- Configuración `.npmrc` para registry alternativo
- Documentación de API contracts (`docs/api-contracts.md`)
- Mockups de diseño:
  - Dashboard principal
  - Página de gráficos/charts
  - Página de reportes
- Sistema de datos mock (`src/data/mockData.js`):
  - Precios actuales de exchanges
  - Histórico de precios generado
  - Alertas de ejemplo
  - Reportes de ejemplo
  - Helpers de formateo
- Estructura de carpetas para desarrollo incremental
- README con quick start y estructura del proyecto

### Planned (Next Sprint)
- Página de Reports
- Integración con API real

