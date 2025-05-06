import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Info, Save, Download, ArrowUpRight, Github } from "lucide-react";
import {
  APP_VERSION,
  GITHUB_URL,
  CENTRAL_GO_URL,
  BEIAN_CONFIG,
  PERSONAL_URL,
  CENTRAL_GO_LOGO_PATH,
  PERSONAL_LOGO_PATH
} from '@/config';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppMenuItemsProps {
  onShowHelp: () => void;
  onExportConfig: () => void;
  onImportConfig: () => void;
  onExportJpg: () => void;
  onExportSvg: () => void;
  onShowLicense: () => void;
  onShowContribution: () => void;
  variant?: "mobile" | "desktop";
}

export function AppMenuItems({
  onShowHelp,
  onExportConfig,
  onImportConfig,
  onExportJpg,
  onExportSvg,
  onShowLicense,
  onShowContribution,
  variant = "desktop"
}: AppMenuItemsProps) {
  const isMobile = variant === "mobile";

  const commonButtonProps = isMobile ? {
    className: "w-full justify-start",
    size: "sm" as const
  } : {
    size: "sm" as const
  };

  return (
    <div className={isMobile ? "flex h-full flex-col justify-between" : "flex flex-row gap-2"}>
      <div className={isMobile ? "flex flex-col gap-2" : "flex flex-row gap-2"}>
        {/* Links Group */}
        <div className={isMobile ? "space-y-2" : "flex items-center gap-2"}>
          <Button
            variant="outline"
            {...commonButtonProps}
            asChild
          >
            <a href={CENTRAL_GO_URL} target="_blank" rel="noopener noreferrer">
              <img src={CENTRAL_GO_LOGO_PATH} alt="Logo" className="h-4 w-4 mr-2" />
              Central Go
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </a>
          </Button>

          <Button
            variant="outline"
            {...commonButtonProps}
            asChild
          >
            <a href={PERSONAL_URL} target="_blank" rel="noopener noreferrer">
              <img src={PERSONAL_LOGO_PATH} alt="Logo" className="h-4 w-4 mr-2" />
              Ryan.G
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>

        {/* Help & Export Group */}
        {isMobile ? <Separator className="my-1" /> : <Separator orientation="vertical" className="h-6" />}

        <div className={isMobile ? "space-y-2" : "flex items-center gap-2"}>
          <Button
            variant="outline"
            {...commonButtonProps}
            onClick={onShowHelp}
          >
            <Info className="h-4 w-4 mr-2" />
            帮助
          </Button>

          <Button
            variant="outline"
            {...commonButtonProps}
            onClick={onExportConfig}
          >
            <Save className="h-4 w-4 mr-2" />
            导出配置
          </Button>

          <Button
            variant="outline"
            {...commonButtonProps}
            onClick={onImportConfig}
          >
            <Download className="h-4 w-4 mr-2" />
            导入配置
          </Button>
        </div>

        {/* Export Image Group */}
        {isMobile ? <Separator className="my-1" /> : <Separator orientation="vertical" className="h-6" />}

        <div className={isMobile ? "space-y-2" : "flex items-center gap-2"}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button {...commonButtonProps}>
                <Download className="h-4 w-4 mr-2" />
                导出图片
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onExportJpg}>
                <Download className="h-4 w-4 mr-2" />
                导出JPG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportSvg}>
                <Download className="h-4 w-4 mr-2" />
                导出SVG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Footer Group (仅在移动端显示) */}
      {isMobile && (
        <div>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowLicense}
              className="w-full justify-start text-xs"
            >
              版权说明
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowContribution}
              className="w-full justify-start text-xs"
            >
              贡献指南
            </Button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-3 w-3" />
              GitHub
            </a>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {APP_VERSION}
            </div>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {BEIAN_CONFIG.copyright}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
