"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "../../components/publics/ui_publics/NavbarSectionEffect";
import { useState } from "react";

export function NavbarSection() {
  const navItems = [
    {
      name: "Fitur",
      link: "#features",
    },
    {
      name: "Cara Kerja",
      link: "#how-it-works",
    },
    {
      name: "FAQ",
      link: "#faq",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect current page
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath === "/login";
  const isRegisterPage = currentPath === "/register";
  const isLandingPage = currentPath === "/";

  // Function to handle smooth scrolling with offset for fixed navbar (only on landing page)
  const handleNavClick = (e, link) => {
    e.preventDefault();
    if (isLandingPage) {
      const target = document.querySelector(link);
      if (target) {
        const offsetTop = target.offsetTop - 100; // 100px offset for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    } else {
      // If not on landing page, go to landing page first
      window.location.href = "/" + link;
    }
  };

  // Function to handle Login navigation
  const handleLoginClick = () => {
    if (isLoginPage) {
      // If already on login page, go to home
      window.location.href = "/";
    } else {
      // Navigate to login page
      window.location.href = "/login";
    }
  };

  // Function to handle Register navigation
  const handleRegisterClick = () => {
    if (isRegisterPage) {
      // If already on register page, go to home
      window.location.href = "/";
    } else {
      // Navigate to register page
      window.location.href = "/register";
    }
  };

  // Function to render appropriate buttons based on current page
  const renderNavButtons = () => {
    if (isLoginPage) {
      return (
        <>
          <NavbarButton variant="dark" onClick={handleLoginClick}>
            Beranda
          </NavbarButton>
          <NavbarButton variant="primary" onClick={handleRegisterClick}>
            Daftar
          </NavbarButton>
        </>
      );
    } else if (isRegisterPage) {
      return (
        <>
          <NavbarButton variant="dark" onClick={handleLoginClick}>
            Masuk
          </NavbarButton>
          <NavbarButton variant="primary" onClick={handleRegisterClick}>
            Beranda
          </NavbarButton>
        </>
      );
    } else {
      // Landing page
      return (
        <>
          <NavbarButton variant="secondary" onClick={handleLoginClick}>
            Masuk
          </NavbarButton>
          <NavbarButton variant="primary" onClick={handleRegisterClick}>
            Daftar
          </NavbarButton>
        </>
      );
    }
  };

  // Function to render mobile nav buttons
  const renderMobileNavButtons = () => {
    if (isLoginPage) {
      return (
        <>
          <NavbarButton
            onClick={() => {
              handleLoginClick();
              setIsMobileMenuOpen(false);
            }}
            variant="dark"
            className="w-full"
          >
            Beranda
          </NavbarButton>
          <NavbarButton
            onClick={() => {
              handleRegisterClick();
              setIsMobileMenuOpen(false);
            }}
            variant="primary"
            className="w-full"
          >
            Daftar
          </NavbarButton>
        </>
      );
    } else if (isRegisterPage) {
      return (
        <>
          <NavbarButton
            onClick={() => {
              handleLoginClick();
              setIsMobileMenuOpen(false);
            }}
            variant="dark"
            className="w-full"
          >
            Masuk
          </NavbarButton>
          <NavbarButton
            onClick={() => {
              handleRegisterClick();
              setIsMobileMenuOpen(false);
            }}
            variant="primary"
            className="w-full"
          >
            Beranda
          </NavbarButton>
        </>
      );
    } else {
      // Landing page
      return (
        <>
          <NavbarButton
            onClick={() => {
              handleLoginClick();
              setIsMobileMenuOpen(false);
            }}
            variant="primary"
            className="w-full"
          >
            Masuk
          </NavbarButton>
          <NavbarButton
            onClick={() => {
              handleRegisterClick();
              setIsMobileMenuOpen(false);
            }}
            variant="primary"
            className="w-full"
          >
            Daftar
          </NavbarButton>
        </>
      );
    }
  };

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo isAuthPage={isLoginPage || isRegisterPage} />
          <NavItems
            items={navItems}
            onItemClick={handleNavClick}
            hidden={!isLandingPage}
          />
          <div className="flex items-center gap-4">{renderNavButtons()}</div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo isAuthPage={isLoginPage || isRegisterPage} />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              isAuthPage={isLoginPage || isRegisterPage}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {isLandingPage &&
              navItems.map((item, idx) => (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={(e) => {
                    handleNavClick(e, item.link);
                    setIsMobileMenuOpen(false);
                  }}
                  className="relative text-neutral-600 dark:text-neutral-300 cursor-pointer"
                >
                  <span className="block">{item.name}</span>
                </a>
              ))}
            <div className="flex w-full flex-col gap-4">
              {renderMobileNavButtons()}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
