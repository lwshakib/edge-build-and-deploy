export type HeaderFooterDesign = {
  colorPalette: {
    background: {
      primary: string;
      secondary: string;
      card: string;
    };
    accent: {
      primary: string;
      secondary: string;
      gradient: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      accent: string;
    };
    border: {
      default: string;
      hover: string;
    };
  };
  header: {
    logo: {
      text: string;
      icon: string;
      gradient: string;
    };
    navigation: Array<{ label: string; href: string }>;
    actions: Array<{
      label: string;
      type: "outline" | "primary";
      variant: string;
      href: string;
      icon?: string;
    }>;
    status: {
      show: boolean;
      text: string;
      color: string;
    };
    behavior: {
      sticky: boolean;
      scrollThreshold: number;
      blurOnScroll: boolean;
      hideOnScrollDown: boolean;
    };
    mobile: {
      hamburgerIcon: string;
      closeIcon: string;
      menuPosition: "left" | "right";
      overlay: boolean;
    };
  };
  footer: {
    brand: {
      logo: string;
      icon: string;
      tagline: string;
      description: string;
    };
    social: Array<{
      platform: string;
      icon: string;
      href: string;
    }>;
    columns: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    newsletter: {
      show: boolean;
      title: string;
      description: string;
      placeholder: string;
      buttonText: string;
      position: string;
    };
    bottom: {
      copyright: string;
      legal: Array<{ label: string; href: string }>;
      badges: Array<{ text: string; show: boolean }>;
    };
  };
  animations: {
    header: {
      scroll: {
        backgroundOpacity: { from: number; to: number };
        borderOpacity: { from: number; to: number };
        blur: { from: string; to: string };
        duration: number;
      };
      logo: {
        hover: { scale: number; duration: number };
      };
      links: {
        hover: { color: string; underline: boolean; duration: number };
      };
      mobileMenu: {
        animation: string;
        duration: number;
        overlay: { opacity: number; blur: string };
      };
    };
    footer: {
      section: {
        initial: { opacity: number; y: number };
        animate: { opacity: number; y: number };
        transition: { duration: number; ease: string };
      };
      stagger: {
        children: number;
      };
      links: {
        hover: { x: number; color: string; duration: number };
      };
      social: {
        hover: {
          scale: number;
          rotate: number;
          glow: boolean;
          duration: number;
        };
      };
    };
  };
  responsive: {
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
      wide: string;
    };
    header: {
      mobile: {
        hideNavigation: boolean;
        showHamburger: boolean;
        centerLogo: boolean;
      };
      tablet: {
        hideNavigation: boolean;
        showHamburger: boolean;
      };
    };
    footer: {
      mobile: {
        columns: number;
        collapsible: boolean;
        stackSocial: boolean;
      };
      tablet: {
        columns: number;
        collapsible: boolean;
      };
      desktop: {
        columns: number;
        collapsible: boolean;
      };
    };
  };
  typography: {
    header: {
      logo: string;
      navigation: string;
      button: string;
    };
    footer: {
      brand: string;
      columnTitle: string;
      links: string;
      copyright: string;
      legal: string;
    };
  };
  spacing: {
    header: {
      height: string;
      padding: { x: string; y: string };
      gap: string;
    };
    footer: {
      padding: { top: string; bottom: string; x: string };
      columnGap: string;
      linkGap: string;
    };
  };
  effects: {
    blur: string;
    shadow: string;
    glow: string;
    border: string;
  };
};

