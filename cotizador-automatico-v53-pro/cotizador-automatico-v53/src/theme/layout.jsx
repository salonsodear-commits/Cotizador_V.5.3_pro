/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * layout.jsx - Estructura visual principal
 * 
 * Contenedor global, header corporativo, main y footer
 * Integración con theme.js y styles.css
 */

import React, { useState } from 'react';
import { Menu, X, FileSpreadsheet, Settings, HelpCircle, ChevronDown } from 'lucide-react';

/**
 * Layout principal del sistema
 * 
 * Props:
 * - children: contenido principal
 * - logo: logo base64 opcional
 * - nombreProyecto: nombre del proyecto actual
 * - version: versión del sistema
 * - onConfigClick: callback para abrir configuración
 * - onHelpClick: callback para abrir ayuda
 * - showSidebar: mostrar sidebar (default: false)
 * - sidebarContent: contenido del sidebar
 */
const Layout = ({
  children,
  logo,
  nombreProyecto = 'Nueva Cotización',
  version = 'V5.3 PRO',
  onConfigClick,
  onHelpClick,
  showSidebar = false,
  sidebarContent
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(showSidebar);

  const currentYear = new Date().getFullYear();

  return (
    <div className="layout-container">
      {/* Estilos inline para el layout */}
      <style>{`
        .layout-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--gray-100, #F5F7FA);
        }

        /* Header */
        .layout-header {
          background: linear-gradient(135deg, var(--primary-dark, #1B3552) 0%, var(--primary, #2A4E77) 100%);
          color: white;
          min-height: 60px;
          padding: 0 var(--space-lg, 24px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          position: sticky;
          top: 0;
          z-index: var(--z-sticky, 200);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--space-md, 16px);
        }

        .header-logo {
          height: 36px;
          width: auto;
        }

        .header-title {
          display: flex;
          flex-direction: column;
        }

        .header-title h1 {
          font-size: var(--font-lg, 18px);
          font-weight: 600;
          margin: 0;
          color: white;
          line-height: 1.2;
        }

        .header-subtitle {
          font-size: var(--font-xs, 11px);
          opacity: 0.8;
          margin-top: 2px;
        }

        .header-center {
          display: flex;
          align-items: center;
          gap: var(--space-sm, 12px);
        }

        .header-project {
          background: rgba(255, 255, 255, 0.1);
          padding: var(--space-xs, 8px) var(--space-md, 16px);
          border-radius: var(--radius, 6px);
          font-size: var(--font-sm, 13px);
          display: flex;
          align-items: center;
          gap: var(--space-xs, 8px);
        }

        .header-project-icon {
          opacity: 0.8;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--space-sm, 12px);
        }

        .header-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          padding: var(--space-xs, 8px);
          border-radius: var(--radius, 6px);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 150ms ease;
        }

        .header-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .header-version {
          font-size: var(--font-xs, 11px);
          background: rgba(255, 255, 255, 0.15);
          padding: var(--space-xxs, 4px) var(--space-xs, 8px);
          border-radius: var(--radius-full, 9999px);
          font-weight: 500;
        }

        .menu-toggle {
          display: none;
        }

        /* Main wrapper */
        .layout-wrapper {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* Sidebar */
        .layout-sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid var(--border-color, #D0D6DE);
          padding: var(--space-md, 16px);
          overflow-y: auto;
          flex-shrink: 0;
          transition: transform 300ms ease, width 300ms ease;
        }

        .layout-sidebar.closed {
          width: 0;
          padding: 0;
          overflow: hidden;
        }

        /* Main content */
        .layout-main {
          flex: 1;
          padding: var(--space-lg, 24px);
          overflow-y: auto;
          background-color: var(--gray-100, #F5F7FA);
        }

        .layout-main-inner {
          max-width: 1600px;
          margin: 0 auto;
        }

        /* Footer */
        .layout-footer {
          background-color: var(--gray-200, #E9ECF1);
          color: var(--gray-600, #576273);
          padding: var(--space-sm, 12px) var(--space-lg, 24px);
          text-align: center;
          font-size: var(--font-xs, 11px);
          border-top: 1px solid var(--border-color, #D0D6DE);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-sm, 12px);
        }

        .footer-left, .footer-right {
          display: flex;
          align-items: center;
          gap: var(--space-sm, 12px);
        }

        .footer-divider {
          width: 1px;
          height: 12px;
          background: var(--gray-400, #A7B0BC);
        }

        /* Mobile menu overlay */
        .mobile-menu-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: var(--z-modal-backdrop, 400);
        }

        .mobile-menu-overlay.open {
          display: block;
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          right: -280px;
          width: 280px;
          height: 100vh;
          background: white;
          z-index: var(--z-modal, 500);
          transition: right 300ms ease;
          padding: var(--space-lg, 24px);
          box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
        }

        .mobile-menu.open {
          right: 0;
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-lg, 24px);
          padding-bottom: var(--space-md, 16px);
          border-bottom: 1px solid var(--border-light, #E9ECF1);
        }

        .mobile-menu-header h3 {
          margin: 0;
          font-size: var(--font-md, 15px);
          color: var(--gray-800, #2D3440);
        }

        .mobile-menu-close {
          background: none;
          border: none;
          color: var(--gray-500, #7B8796);
          cursor: pointer;
          padding: var(--space-xs, 8px);
        }

        .mobile-menu-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs, 8px);
        }

        .mobile-menu-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm, 12px);
          padding: var(--space-sm, 12px);
          border-radius: var(--radius, 6px);
          color: var(--gray-700, #3D4654);
          text-decoration: none;
          cursor: pointer;
          transition: background 150ms ease;
        }

        .mobile-menu-item:hover {
          background: var(--gray-100, #F5F7FA);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .layout-header {
            padding: 0 var(--space-md, 16px);
            min-height: 56px;
          }

          .header-center {
            display: none;
          }

          .header-title h1 {
            font-size: var(--font-md, 15px);
          }

          .header-subtitle {
            display: none;
          }

          .header-version {
            display: none;
          }

          .menu-toggle {
            display: flex;
          }

          .header-btn.desktop-only {
            display: none;
          }

          .layout-sidebar {
            position: fixed;
            left: -280px;
            top: 56px;
            bottom: 0;
            z-index: var(--z-fixed, 300);
            transition: left 300ms ease;
          }

          .layout-sidebar.open {
            left: 0;
          }

          .layout-main {
            padding: var(--space-md, 16px);
          }

          .layout-footer {
            flex-direction: column;
            text-align: center;
            padding: var(--space-md, 16px);
          }

          .footer-left, .footer-right {
            justify-content: center;
          }

          .footer-divider {
            display: none;
          }
        }

        @media (max-width: 576px) {
          .layout-main {
            padding: var(--space-sm, 12px);
          }

          .header-logo {
            height: 28px;
          }

          .header-project {
            display: none;
          }
        }

        /* Print */
        @media print {
          .layout-header,
          .layout-footer,
          .layout-sidebar {
            display: none;
          }

          .layout-main {
            padding: 0;
          }
        }
      `}</style>

      {/* Header */}
      <header className="layout-header">
        <div className="header-left">
          {logo && (
            <img src={logo} alt="Logo" className="header-logo" />
          )}
          <div className="header-title">
            <h1>Cotizador Automático</h1>
            <span className="header-subtitle">Sistema de Cotización Profesional</span>
          </div>
        </div>

        <div className="header-center">
          <div className="header-project">
            <FileSpreadsheet size={16} className="header-project-icon" />
            <span>{nombreProyecto}</span>
          </div>
        </div>

        <div className="header-right">
          <span className="header-version">{version}</span>
          
          {onConfigClick && (
            <button 
              className="header-btn desktop-only" 
              onClick={onConfigClick}
              title="Configuración"
              aria-label="Abrir configuración"
            >
              <Settings size={18} />
            </button>
          )}
          
          {onHelpClick && (
            <button 
              className="header-btn desktop-only" 
              onClick={onHelpClick}
              title="Ayuda"
              aria-label="Abrir ayuda"
            >
              <HelpCircle size={18} />
            </button>
          )}

          <button 
            className="header-btn menu-toggle" 
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div 
        className={`mobile-menu-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <h3>Menú</h3>
          <button 
            className="mobile-menu-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mobile-menu-items">
          <div className="mobile-menu-item" onClick={() => { onConfigClick?.(); setMenuOpen(false); }}>
            <Settings size={18} />
            <span>Configuración</span>
          </div>
          <div className="mobile-menu-item" onClick={() => { onHelpClick?.(); setMenuOpen(false); }}>
            <HelpCircle size={18} />
            <span>Ayuda</span>
          </div>
        </div>
      </div>

      {/* Main wrapper */}
      <div className="layout-wrapper">
        {/* Sidebar opcional */}
        {sidebarContent && (
          <aside className={`layout-sidebar ${sidebarOpen ? '' : 'closed'}`}>
            {sidebarContent}
          </aside>
        )}

        {/* Main content */}
        <main className="layout-main">
          <div className="layout-main-inner">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="layout-footer">
        <div className="footer-left">
          <span>Cotizador Automático</span>
          <span className="footer-divider" />
          <span>{version}</span>
        </div>
        <div className="footer-right">
          <span>© {currentYear} Sistema de Cotización</span>
          <span className="footer-divider" />
          <span>Todos los derechos reservados</span>
        </div>
      </footer>
    </div>
  );
};

/**
 * Componente de sección para organizar contenido
 */
export const Section = ({ 
  title, 
  subtitle,
  icon: Icon,
  children, 
  actions,
  collapsible = false,
  defaultOpen = true,
  className = ''
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`layout-section ${className}`}>
      <style>{`
        .layout-section {
          background: white;
          border: 1px solid var(--border-light, #E9ECF1);
          border-radius: var(--radius-lg, 8px);
          box-shadow: var(--shadow-card, 0 2px 4px rgba(0,0,0,0.08));
          margin-bottom: var(--space-md, 16px);
          overflow: hidden;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md, 16px);
          border-bottom: 1px solid var(--border-light, #E9ECF1);
          background: var(--gray-50, #FAFBFC);
        }

        .section-header.collapsible {
          cursor: pointer;
          user-select: none;
        }

        .section-header.collapsible:hover {
          background: var(--gray-100, #F5F7FA);
        }

        .section-title-group {
          display: flex;
          align-items: center;
          gap: var(--space-sm, 12px);
        }

        .section-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary, #2A4E77);
          color: white;
          border-radius: var(--radius, 6px);
        }

        .section-title {
          font-size: var(--font-md, 15px);
          font-weight: 600;
          color: var(--gray-800, #2D3440);
          margin: 0;
        }

        .section-subtitle {
          font-size: var(--font-xs, 11px);
          color: var(--gray-500, #7B8796);
          margin-top: 2px;
        }

        .section-actions {
          display: flex;
          align-items: center;
          gap: var(--space-xs, 8px);
        }

        .section-toggle {
          transition: transform 200ms ease;
        }

        .section-toggle.closed {
          transform: rotate(-90deg);
        }

        .section-body {
          padding: var(--space-md, 16px);
        }

        .section-body.collapsed {
          display: none;
        }
      `}</style>

      <div 
        className={`section-header ${collapsible ? 'collapsible' : ''}`}
        onClick={collapsible ? () => setOpen(!open) : undefined}
      >
        <div className="section-title-group">
          {Icon && (
            <div className="section-icon">
              <Icon size={18} />
            </div>
          )}
          <div>
            <h3 className="section-title">{title}</h3>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        </div>
        <div className="section-actions">
          {actions}
          {collapsible && (
            <ChevronDown 
              size={18} 
              className={`section-toggle ${!open ? 'closed' : ''}`}
            />
          )}
        </div>
      </div>

      <div className={`section-body ${!open && collapsible ? 'collapsed' : ''}`}>
        {children}
      </div>
    </section>
  );
};

/**
 * Componente de página para wrapping de contenido
 */
export const Page = ({ 
  title, 
  subtitle,
  actions,
  children 
}) => {
  return (
    <div className="layout-page">
      <style>{`
        .layout-page {
          animation: fadeIn 200ms ease;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-lg, 24px);
          flex-wrap: wrap;
          gap: var(--space-md, 16px);
        }

        .page-title {
          font-size: var(--font-xl, 22px);
          font-weight: 600;
          color: var(--gray-800, #2D3440);
          margin: 0 0 var(--space-xxs, 4px) 0;
        }

        .page-subtitle {
          font-size: var(--font-sm, 13px);
          color: var(--gray-500, #7B8796);
          margin: 0;
        }

        .page-actions {
          display: flex;
          align-items: center;
          gap: var(--space-sm, 12px);
        }

        .page-content {
          /* Contenido principal */
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {(title || actions) && (
        <div className="page-header">
          <div>
            {title && <h2 className="page-title">{title}</h2>}
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="page-actions">{actions}</div>}
        </div>
      )}

      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
