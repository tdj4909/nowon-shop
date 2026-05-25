import { createContext, useContext, useEffect, useState } from "react";

type SidebarContextType = {
  /** 사이드바 펼침 여부 (데스크탑) */
  isExpanded: boolean;
  /** 사이드바 열림 여부 (모바일 — 오버레이로 표시) */
  isMobileOpen: boolean;
  /** 사이드바 hover 상태 (접힌 상태에서 hover 시 임시 펼침) */
  isHovered: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 화면 크기 변화에 따라 모바일 여부를 추적 — 데스크탑 전환 시 모바일 드로어를 자동으로 닫음
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        // 모바일에서는 isExpanded를 항상 false로 강제 (모바일은 isMobileOpen으로만 제어)
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isHovered,
        toggleSidebar,
        toggleMobileSidebar,
        setIsHovered,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
