
import { supabase } from "@/integrations/supabase/client";

export interface AuditEvent {
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AuditLogger {
  static async logEvent(event: AuditEvent): Promise<void> {
    try {
      // For now, log to console until security_audit_logs table is created
      console.log('Security Audit Event:', {
        timestamp: new Date().toISOString(),
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        details: event.details,
        severity: event.severity
      });

      // TODO: Replace with database logging once migration is approved
      // const { error } = await supabase.from('security_audit_logs').insert({...});
    } catch (error) {
      console.error('Audit logger error:', error);
    }
  }

  // Predefined security events
  static async logSecurityEvent(type: string, details: Record<string, any>, severity: AuditEvent['severity'] = 'medium'): Promise<void> {
    await this.logEvent({
      action: type,
      resource: 'security',
      details,
      severity,
      userId: (await supabase.auth.getUser()).data.user?.id,
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
    });
  }

  static async logAuthEvent(action: string, success: boolean, details?: Record<string, any>): Promise<void> {
    await this.logEvent({
      action: `auth_${action}`,
      resource: 'authentication',
      details: { success, ...details },
      severity: success ? 'low' : 'medium',
      userId: (await supabase.auth.getUser()).data.user?.id,
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
    });
  }

  static async logDataEvent(action: string, table: string, recordId?: string, details?: Record<string, any>): Promise<void> {
    await this.logEvent({
      action: `data_${action}`,
      resource: table,
      resourceId: recordId,
      details,
      severity: 'low',
      userId: (await supabase.auth.getUser()).data.user?.id,
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
    });
  }

  private static async getClientIP(): Promise<string> {
    try {
      const { data } = await supabase.functions.invoke('get-client-ip');
      return data?.ip_address || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}
