import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaChartPie,
  FaArrowRightArrowLeft,
  FaWallet,
  FaBullseye,
  FaChartColumn,
  FaRegMessage,
  FaGear,
  FaArrowRightFromBracket,
  FaUser,
  FaEllipsis,
  FaBars,
  FaXmark,
} from "react-icons/fa6";

export type Page =
  | "dashboard"
  | "transactions"
  | "budgets"
  | "goals"
  | "reports"
  | "assistant"
  | "settings";

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  userName?: string | null;
  userEmail?: string | null;
  onLogout: () => void;
}

function getInitials(
  name?: string | null
) {
  if (!name) {
    return "US";
  }

  const parts = name
    .trim()
    .split(" ")
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function Sidebar({
  currentPage,
  onPageChange,
  userName,
  userEmail,
  onLogout,
}: SidebarProps) {
  const [
    isUserMenuOpen,
    setIsUserMenuOpen,
  ] = useState(false);

  const [
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  ] = useState(false);

  const userMenuRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const displayName =
    userName?.trim() ||
    userEmail?.split("@")[0] ||
    "Usuário";

  const initials =
    getInitials(displayName);

  /* =========================
     FECHAR MENU DO USUÁRIO
     AO CLICAR FORA
  ========================= */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================
     BLOQUEAR SCROLL QUANDO
     MENU MOBILE ESTIVER ABERTO
  ========================= */

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  /* =========================
     FECHAR MENU MOBILE AO
     AUMENTAR A TELA
  ========================= */

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 650) {
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  /* =========================
     TROCAR PÁGINA
  ========================= */

  function handlePageChange(
    page: Page
  ) {
    onPageChange(page);

    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }

  /* =========================
     SAIR
  ========================= */

  function handleLogoutClick() {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);

    onLogout();
  }

  /* =========================
     ABRIR / FECHAR MOBILE
  ========================= */

  function openMobileMenu() {
    setIsMobileMenuOpen(true);
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }

  return (
    <>
      {/* =========================
          BOTÃO MOBILE
      ========================= */}

      <button
        type="button"
        className="mobile-menu-button"
        onClick={openMobileMenu}
        aria-label="Abrir menu"
        aria-expanded={
          isMobileMenuOpen
        }
      >
        <FaBars />
      </button>

      {/* =========================
          FUNDO ESCURO MOBILE
      ========================= */}

      <div
        className={`mobile-sidebar-overlay ${
          isMobileMenuOpen
            ? "mobile-sidebar-overlay-open"
            : ""
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        className={`sidebar ${
          isMobileMenuOpen
            ? "sidebar-mobile-open"
            : ""
        }`}
      >
        {/* =========================
            CABEÇALHO / LOGO
        ========================= */}

        <div className="sidebar-mobile-header">
          <div className="sidebar-brand">
            <img
              src="/logo-finansmart.png"
              alt="FinanSmart"
              className="sidebar-brand-logo"
            />

            <span>FinanSmart</span>
          </div>

          <button
            type="button"
            className="mobile-menu-close"
            onClick={closeMobileMenu}
            aria-label="Fechar menu"
          >
            <FaXmark />
          </button>
        </div>

        {/* =========================
            NAVEGAÇÃO
        ========================= */}

        <nav className="sidebar-navigation">
          <span className="nav-label">
            Principal
          </span>

          {/* VISÃO GERAL */}

          <button
            type="button"
            className={`nav-item ${
              currentPage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handlePageChange(
                "dashboard"
              )
            }
          >
            <FaChartPie />

            <span>Visão geral</span>
          </button>

          {/* TRANSAÇÕES */}

          <button
            type="button"
            className={`nav-item ${
              currentPage ===
              "transactions"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handlePageChange(
                "transactions"
              )
            }
          >
            <FaArrowRightArrowLeft />

            <span>Transações</span>
          </button>

          {/* ORÇAMENTOS */}

          <button
            type="button"
            className={`nav-item ${
              currentPage === "budgets"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handlePageChange(
                "budgets"
              )
            }
          >
            <FaWallet />

            <span>Orçamentos</span>
          </button>

          {/* METAS */}

          <button
            type="button"
            className={`nav-item ${
              currentPage === "goals"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handlePageChange(
                "goals"
              )
            }
          >
            <FaBullseye />

            <span>Metas</span>
          </button>

          {/* RELATÓRIOS */}

          <button
            type="button"
            className={`nav-item ${
              currentPage === "reports"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handlePageChange(
                "reports"
              )
            }
          >
            <FaChartColumn />

            <span>Relatórios</span>
          </button>

          {/* FERRAMENTAS */}

          <span className="nav-label secondary-label">
            Ferramentas
          </span>

          {/* ASSISTENTE */}

          <button
            type="button"
            className={`nav-item ${
              currentPage ===
              "assistant"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handlePageChange(
                "assistant"
              )
            }
          >
            <FaRegMessage />

            <span>Assistente</span>
          </button>
        </nav>

        {/* =========================
            RODAPÉ
        ========================= */}

        <div className="sidebar-footer">
          {/* CONFIGURAÇÕES */}

          <button
            type="button"
            className={`nav-item ${
              currentPage === "settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handlePageChange(
                "settings"
              )
            }
          >
            <FaGear />

            <span>Configurações</span>
          </button>

          {/* SAIR */}

          <button
            type="button"
            className="nav-item logout-button"
            onClick={
              handleLogoutClick
            }
          >
            <FaArrowRightFromBracket />

            <span>Sair</span>
          </button>

          {/* =========================
              USUÁRIO
          ========================= */}

          <div
            className="sidebar-user-wrapper"
            ref={userMenuRef}
          >
            {/* MENU DO USUÁRIO */}

            {isUserMenuOpen && (
              <div className="sidebar-user-menu">
                <div className="sidebar-user-menu-header">
                  <div className="sidebar-user-menu-avatar">
                    {initials}
                  </div>

                  <div>
                    <strong>
                      {displayName}
                    </strong>

                    <span>
                      {userEmail ||
                        "Conta pessoal"}
                    </span>
                  </div>
                </div>

                <div className="sidebar-user-menu-divider" />

                <button
                  type="button"
                  className="sidebar-user-menu-item"
                  onClick={() =>
                    handlePageChange(
                      "settings"
                    )
                  }
                >
                  <FaUser />

                  <div>
                    <strong>
                      Minha conta
                    </strong>

                    <span>
                      Dados pessoais e
                      segurança
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className="sidebar-user-menu-item"
                  onClick={() =>
                    handlePageChange(
                      "settings"
                    )
                  }
                >
                  <FaGear />

                  <div>
                    <strong>
                      Configurações
                    </strong>

                    <span>
                      Gerencie sua conta
                    </span>
                  </div>
                </button>

                <div className="sidebar-user-menu-divider" />

                <button
                  type="button"
                  className="sidebar-user-menu-item sidebar-user-menu-logout"
                  onClick={
                    handleLogoutClick
                  }
                >
                  <FaArrowRightFromBracket />

                  <div>
                    <strong>
                      Sair da conta
                    </strong>

                    <span>
                      Encerrar esta sessão
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* PERFIL */}

            <div
              className={`sidebar-user ${
                isUserMenuOpen
                  ? "menu-open"
                  : ""
              }`}
            >
              <button
                type="button"
                className="sidebar-user-main"
                onClick={() =>
                  setIsUserMenuOpen(
                    (current) =>
                      !current
                  )
                }
                aria-expanded={
                  isUserMenuOpen
                }
                aria-label="Abrir menu da conta"
              >
                <div className="sidebar-avatar">
                  {initials}
                </div>

                <div className="sidebar-user-info">
                  <strong>
                    {displayName}
                  </strong>

                  <span>
                    {userEmail ||
                      "Conta pessoal"}
                  </span>
                </div>
              </button>

              <button
                type="button"
                className="user-options"
                onClick={() =>
                  setIsUserMenuOpen(
                    (current) =>
                      !current
                  )
                }
                aria-expanded={
                  isUserMenuOpen
                }
                aria-label="Opções da conta"
              >
                <FaEllipsis />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;