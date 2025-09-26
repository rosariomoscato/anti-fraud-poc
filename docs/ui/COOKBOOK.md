# UI Component Cookbook

## Overview

This cookbook provides practical examples and patterns for implementing common UI components and interactions in the anti-fraud POC system. Each example follows the design system principles and uses the established tokens.

## Dashboard Components

### Key Metrics Cards
**Display critical fraud detection metrics**

```tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Shield, BarChart3 } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  variant?: "default" | "warning" | "danger" | "success";
}

function MetricCard({ title, value, change, trend, icon, variant = "default" }: MetricCardProps) {
  const getVariantColors = () => {
    switch (variant) {
      case "warning": return "text-orange-600 bg-orange-50";
      case "danger": return "text-red-600 bg-red-50";
      case "success": return "text-green-600 bg-green-50";
      default: return "text-blue-600 bg-blue-50";
    }
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-gray-600";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {change && (
            <p className={`text-sm flex items-center gap-1 mt-2 ${getTrendColor()}`}>
              {trend === "up" && <TrendingUp className="h-3 w-3" />}
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${getVariantColors()}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// Usage
function DashboardMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Claims"
        value="1,247"
        change="+12% vs last month"
        trend="up"
        icon={<BarChart3 className="h-6 w-6" />}
      />
      <MetricCard
        title="High Risk Claims"
        value="43"
        change="3.4% of total"
        variant="warning"
        icon={<AlertTriangle className="h-6 w-6" />}
      />
      <MetricCard
        title="Fraud Detected"
        value="12"
        change="0.9% detection rate"
        variant="danger"
        icon={<Shield className="h-6 w-6" />}
      />
    </div>
  );
}
```

### Risk Score Indicator
**Visual representation of risk assessment**

```tsx
interface RiskScoreProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function RiskScore({ score, size = "md", showLabel = true }: RiskScoreProps) {
  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-green-600 bg-green-100 border-green-500";
    if (score <= 70) return "text-yellow-600 bg-yellow-100 border-yellow-500";
    return "text-red-600 bg-red-100 border-red-500";
  };

  const getRiskLabel = (score: number) => {
    if (score <= 30) return "Low Risk";
    if (score <= 70) return "Medium Risk";
    return "High Risk";
  };

  const sizeClasses = {
    sm: "text-lg px-3 py-1",
    md: "text-xl px-4 py-2", 
    lg: "text-2xl px-6 py-3"
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`
        ${sizeClasses[size]} 
        ${getRiskColor(score)}
        border-2 rounded-lg font-bold text-center min-w-[80px]
      `}>
        {score}
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">
          {getRiskLabel(score)}
        </span>
      )}
    </div>
  );
}

// Usage
function ClaimRiskDisplay() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Risk Assessment</span>
        <RiskScore score={85} size="md" />
      </div>
    </div>
  );
}
```

### Activity Timeline
**Show recent fraud detection activities**

```tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  AlertTriangle, 
  Search, 
  TrendingUp,
  Clock,
  Shield
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'new_claim' | 'fraud_detection' | 'investigation_started' | 'status_change';
  title: string;
  description: string;
  timestamp: string;
  riskScore?: number;
  status?: string;
}

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const iconConfig = {
    new_claim: { icon: BarChart3, color: "blue" },
    fraud_detection: { icon: AlertTriangle, color: "red" },
    investigation_started: { icon: Search, color: "orange" },
    status_change: { icon: TrendingUp, color: "purple" }
  };

  const { icon: Icon, color } = iconConfig[type];
  const colorClasses = {
    blue: "bg-blue-100 border-blue-500 text-blue-600",
    red: "bg-red-100 border-red-500 text-red-600", 
    orange: "bg-orange-100 border-orange-500 text-orange-600",
    purple: "bg-purple-100 border-purple-500 text-purple-600"
  };

  return (
    <div className={`p-2 rounded-lg border-2 ${colorClasses[color]}`}>
      <Icon className="h-4 w-4" />
    </div>
  );
}

function ActivityTimeline({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <ActivityIcon type={activity.type} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-foreground truncate">
                  {activity.title}
                </h4>
                <div className="flex items-center gap-2">
                  {activity.riskScore && (
                    <RiskScore score={activity.riskScore} size="sm" showLabel={false} />
                  )}
                  {activity.status && (
                    <Badge variant="outline">{activity.status}</Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                {activity.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

## Data Visualization Patterns

### Fraud Detection Chart
**Pie chart for risk distribution**

```tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RiskData {
  low: number;
  medium: number;
  high: number;
}

function RiskDistributionChart({ data }: { data: RiskData }) {
  const chartData = [
    { name: 'Low Risk', value: data.low, color: '#22c55e' },
    { name: 'Medium Risk', value: data.medium, color: '#f59e0b' },
    { name: 'High Risk', value: data.high, color: '#ef4444' }
  ];

  const total = data.low + data.medium + data.high;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Risk Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => 
                `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [value, 'Claims']}
              labelFormatter={(label) => label}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Total Claims Analyzed: <span className="font-semibold">{total}</span>
        </p>
      </div>
    </Card>
  );
}
```

### Trend Analysis Chart
**Line chart for fraud detection trends**

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendData {
  date: string;
  claims: number;
  fraudDetected: number;
  riskScore: number;
}

function FraudTrendChart({ data }: { data: TrendData[] }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Fraud Detection Trends</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="claims"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              name="Total Claims"
            />
            <Line
              type="monotone"
              dataKey="fraudDetected"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              name="Fraud Detected"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
```

## Form Patterns

### Claim Submission Form
**Multi-step form with validation**

```tsx
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ClaimFormData {
  claimantInfo: {
    name: string;
    email: string;
    phone: string;
  };
  incidentDetails: {
    date: string;
    time: string;
    location: string;
    description: string;
  };
  vehicleInfo: {
    make: string;
    model: string;
    year: string;
    licensePlate: string;
  };
}

function ClaimSubmissionForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ClaimFormData>({
    claimantInfo: { name: '', email: '', phone: '' },
    incidentDetails: { date: '', time: '', location: '', description: '' },
    vehicleInfo: { make: '', model: '', year: '', licensePlate: '' }
  });

  const steps = [
    { id: 1, title: 'Claimant Information' },
    { id: 2, title: 'Incident Details' },
    { id: 3, title: 'Vehicle Information' },
    { id: 4, title: 'Review & Submit' }
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {step.id}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:block">
                {step.title}
              </span>
              {step.id < steps.length && (
                <div className="w-16 h-0.5 bg-border mx-4 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Claimant Information</h3>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.claimantInfo.name}
                onChange={(e) => setFormData({
                  ...formData,
                  claimantInfo: { ...formData.claimantInfo, name: e.target.value }
                })}
                placeholder="Enter full name"
              />
            </div>
            {/* Additional fields... */}
          </div>
        )}

        {/* Form Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={currentStep === steps.length}
          >
            {currentStep === steps.length ? 'Submit Claim' : 'Next'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

## Alert & Notification Patterns

### Fraud Detection Alert
**Strategic alerting for different risk levels**

```tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Info, CheckCircle } from "lucide-react";

interface FraudAlertProps {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  actions?: React.ReactNode;
}

function FraudAlert({ severity, title, message, actions }: FraudAlertProps) {
  const alertConfig = {
    critical: {
      icon: AlertTriangle,
      borderColor: 'border-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      badgeVariant: 'destructive' as const
    },
    high: {
      icon: AlertTriangle,
      borderColor: 'border-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-600',
      badgeVariant: 'default' as const
    },
    medium: {
      icon: Shield,
      borderColor: 'border-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      badgeVariant: 'secondary' as const
    },
    low: {
      icon: CheckCircle,
      borderColor: 'border-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      badgeVariant: 'outline' as const
    },
    info: {
      icon: Info,
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      badgeVariant: 'outline' as const
    }
  };

  const config = alertConfig[severity];
  const Icon = config.icon;

  return (
    <Card className={`border-2 ${config.borderColor} ${config.bgColor}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={config.badgeVariant} className="capitalize">
                {severity}
              </Badge>
              <h4 className={`font-semibold ${config.textColor}`}>
                {title}
              </h4>
            </div>
            <p className={`text-sm ${config.textColor} mb-3`}>
              {message}
            </p>
            {actions && (
              <div className="flex gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Usage examples
function AlertExamples() {
  return (
    <div className="space-y-4">
      <FraudAlert
        severity="critical"
        title="Potential Fraud Detected"
        message="High-risk pattern detected in claim SNT-2024-001. Immediate investigation required."
        actions={
          <>
            <Button size="sm">Investigate</Button>
            <Button variant="outline" size="sm">View Details</Button>
          </>
        }
      />
      
      <FraudAlert
        severity="high"
        title="Unusual Activity Pattern"
        message="Multiple claims from same location within short time period detected."
      />
      
      <FraudAlert
        severity="medium"
        title="Investigation Started"
        message="Claim SNT-2024-002 has been flagged for review due to suspicious patterns."
      />
    </div>
  );
}
```

### Toast Notifications
**Transient notifications for user actions**

```tsx
import { toast } from "sonner";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

// Toast utility functions
export function showSuccessToast(message: string) {
  toast.success(message, {
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    className: "bg-green-50 border-green-200 text-green-800"
  });
}

export function showErrorToast(message: string) {
  toast.error(message, {
    icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    className: "bg-red-50 border-red-200 text-red-800"
  });
}

export function showWarningToast(message: string) {
  toast.warning(message, {
    icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
    className: "bg-orange-50 border-orange-200 text-orange-800"
  });
}

export function showInfoToast(message: string) {
  toast.info(message, {
    icon: <Info className="h-5 w-5 text-blue-600" />,
    className: "bg-blue-50 border-blue-200 text-blue-800"
  });
}

// Usage in components
function ClaimActions() {
  const handleDelete = () => {
    try {
      // Delete logic here
      showSuccessToast("Claim deleted successfully");
    } catch (error) {
      showErrorToast("Failed to delete claim");
    }
  };

  return (
    <Button onClick={handleDelete} variant="destructive">
      Delete Claim
    </Button>
  );
}
```

## Loading States

### Skeleton Loading
**Loading placeholders for data-heavy components**

```tsx
function ClaimsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex gap-4 pb-4 border-b">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      
      {/* Row skeletons */}
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="flex gap-4 py-3">
          {[1, 2, 3, 4, 5].map((cell) => (
            <div key={cell} className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function DashboardMetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mt-2 w-3/4"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

## Data Table Patterns

### Enhanced Data Table
**Sortable, filterable table with risk indicators**

```tsx
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter,
  MoreVertical
} from "lucide-react";

interface Claim {
  id: string;
  claimNumber: string;
  claimant: string;
  riskScore: number;
  status: string;
  amount: number;
  date: string;
}

function ClaimsDataTable({ claims }: { claims: Claim[] }) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Claim;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleSort = (key: keyof Claim) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.claimant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (key: keyof Claim) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronDown className="h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <Card>
      {/* Table Header with Controls */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search claims..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('claimNumber')}
              >
                <div className="flex items-center gap-1">
                  Claim Number
                  {getSortIcon('claimNumber')}
                </div>
              </TableHead>
              <TableHead>Claimant</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('riskScore')}
              >
                <div className="flex items-center gap-1">
                  Risk Score
                  {getSortIcon('riskScore')}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center gap-1">
                  Amount
                  {getSortIcon('amount')}
                </div>
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClaims.map((claim) => (
              <TableRow key={claim.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{claim.claimNumber}</TableCell>
                <TableCell>{claim.claimant}</TableCell>
                <TableCell>
                  <RiskScore score={claim.riskScore} size="sm" showLabel={false} />
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{claim.status}</Badge>
                </TableCell>
                <TableCell>€{claim.amount.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(claim.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
```

## Empty States

### Data Empty States
**Helpful empty states for different contexts**

```tsx
function NoClaimsEmptyState() {
  return (
    <Card className="p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Claims Found</h3>
        <p className="text-muted-foreground mb-6">
          There are no claims matching your current filters. Try adjusting your search criteria or create a new claim.
        </p>
        <div className="flex gap-3 justify-center">
          <Button>Clear Filters</Button>
          <Button variant="outline">Create New Claim</Button>
        </div>
      </div>
    </Card>
  );
}

function NoInvestigationsEmptyState() {
  return (
    <Card className="p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Active Investigations</h3>
        <p className="text-muted-foreground mb-6">
          Great! There are currently no fraud investigations in progress. The system is operating normally.
        </p>
        <Button variant="outline">
          View Investigation History
        </Button>
      </div>
    </Card>
  );
}
```

## Mobile Responsive Patterns

### Mobile Dashboard
**Optimized layouts for mobile devices**

```tsx
function MobileDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border-b p-4">
        <h1 className="text-xl font-semibold">Fraud Detection</h1>
        <p className="text-sm text-muted-foreground">System overview</p>
      </div>

      {/* Key Metrics - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-4 px-4">
        <MetricCard
          title="Total"
          value="1,247"
          icon={<BarChart3 className="h-5 w-5" />}
          variant="default"
        />
        <MetricCard
          title="High Risk"
          value="43"
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="warning"
        />
        <MetricCard
          title="Fraud"
          value="12"
          icon={<Shield className="h-5 w-5" />}
          variant="danger"
        />
        <MetricCard
          title="Pending"
          value="156"
          icon={<Clock className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Recent Activity - Collapsible */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {/* Mobile-optimized activity items */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Fraud Detected</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <RiskScore score={85} size="sm" showLabel={false} />
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-2">
        <div className="grid grid-cols-4 gap-1">
          <Button variant="ghost" size="sm" className="flex-col h-16">
            <BarChart3 className="h-5 w-5 mb-1" />
            <span className="text-xs">Dashboard</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-16">
            <Search className="h-5 w-5 mb-1" />
            <span className="text-xs">Investigate</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-16">
            <AlertTriangle className="h-5 w-5 mb-1" />
            <span className="text-xs">Alerts</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-16">
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
```