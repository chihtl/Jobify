'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Progress, Select, Switch } from '@/components/ui';

export default function TestShadcn() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Test Shadcn/UI Components</h1>

      <Card>
        <CardHeader>
          <CardTitle>Button Components</CardTitle>
          <CardDescription>Testing different button variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Components</CardTitle>
          <CardDescription>Testing input and select components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Enter your name" />
          <Select
            placeholder="Select an option"
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
            ]}
          />
          <div className="flex items-center space-x-2">
            <Switch />
            <span>Toggle me</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress Component</CardTitle>
          <CardDescription>Testing progress bar</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={33} className="w-full" />
        </CardContent>
      </Card>
    </div>
  );
} 