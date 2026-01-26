import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GenerationCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  className?: string;
}

export function GenerationCard({ title, description, icon, onClick, className }: GenerationCardProps) {
  return (
    <Card 
      className={cn(
        "card-cosmic cursor-pointer transition-all duration-300 hover:scale-105 hover:border-primary/50 group",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
          {icon}
        </div>
        <CardTitle className="text-xl glow-text">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <span className="text-sm text-primary/70 group-hover:text-primary transition-colors">
          Cliquez pour créer →
        </span>
      </CardContent>
    </Card>
  );
}
