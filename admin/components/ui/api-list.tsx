"use client"
import { useOrigin } from '@/hooks/use-origin';
import { useParams } from 'next/navigation';
import { ApiAlert } from '@/components/ui/api-alert';
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface ApiListProps {
  entityName: string;
  entityIdName: string;
}

export const ApiList: React.FC<ApiListProps> = ({
  entityIdName,
  entityName
}) => {
  const params = useParams();
  const origin = useOrigin();

  const baseUrl = `${origin}/api/${params.labId}`;

  return (
    <Card className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900">
      <CardContent className="p-4 space-y-4">
        <ApiAlert
          title='GET'
          variant='public'
          description={`${baseUrl}/${entityName}`} />
        <ApiAlert
          title='GET'
          variant='public'
          description={`${baseUrl}/${entityName}/{${entityIdName}}`} />
        <ApiAlert
          title='POST'
          variant='admin'
          description={`${baseUrl}/${entityName}`} />
        <ApiAlert
          title='PATCH'
          variant='admin'
          description={`${baseUrl}/${entityName}/{${entityIdName}}`} />
        <ApiAlert
          title='DELETE'
          variant='admin'
          description={`${baseUrl}/${entityName}/{${entityIdName}}`} />
      </CardContent>
    </Card>
  )
}