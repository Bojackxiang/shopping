'use client';

import { CustomerEventType } from '@prisma/client';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AUDIENCE_FIELDS,
  CONDITION_FIELDS_BY_EVENT,
  EVENT_TYPE_LABELS,
  SUPPORTED_EVENT_TYPES
} from '@/lib/events/event-meta';
import type { FormData } from './create-coupon-modal';

const EVENT_OPTIONS = Object.keys(EVENT_TYPE_LABELS) as CustomerEventType[];

export function TriggerFields() {
  const { register, control, watch, setValue } = useFormContext<FormData>();
  const enabled = watch('triggerEnabled');
  const eventType = watch('triggerEvent') as CustomerEventType | undefined;

  const conditionFields = eventType ? CONDITION_FIELDS_BY_EVENT[eventType] : [];

  return (
    <div className='space-y-4'>
      <div className='border-border bg-muted/20 flex items-center justify-between rounded-lg border p-4'>
        <div className='space-y-0.5'>
          <Label htmlFor='trigger-enabled' className='text-base'>
            Auto-grant on customer event
          </Label>
          <p className='text-muted-foreground text-sm'>
            Issue this coupon automatically when a customer triggers a matching event.
          </p>
        </div>
        <Controller
          name='triggerEnabled'
          control={control}
          render={({ field }) => (
            <Switch
              id='trigger-enabled'
              checked={field.value}
              onCheckedChange={(v) => {
                field.onChange(v);
                if (!v) {
                  setValue('triggerEvent', null);
                  setValue('triggerCondition', {});
                  setValue('audienceFilter', {});
                }
              }}
            />
          )}
        />
      </div>

      {enabled && (
        <>
          <div className='space-y-2'>
            <Label htmlFor='trigger-event'>Trigger event</Label>
            <Controller
              name='triggerEvent'
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? undefined}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue('triggerCondition', {});
                  }}
                >
                  <SelectTrigger id='trigger-event'>
                    <SelectValue placeholder='Select an event' />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_OPTIONS.map((evt) => (
                      <SelectItem key={evt} value={evt}>
                        <div className='flex items-center gap-2'>
                          <span>{EVENT_TYPE_LABELS[evt]}</span>
                          {!SUPPORTED_EVENT_TYPES[evt] && (
                            <Badge variant='outline' className='text-[10px]'>
                              Pending integration
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {eventType && !SUPPORTED_EVENT_TYPES[eventType] && (
              <p className='text-muted-foreground text-xs'>
                The triggering business action for this event hasn’t been wired up yet. The rule will save but won’t fire until the integration lands.
              </p>
            )}
          </div>

          {conditionFields.length > 0 && (
            <div className='space-y-3'>
              <Label>Conditions (all must match)</Label>
              <div className='grid gap-4 sm:grid-cols-2'>
                {conditionFields.map((f) => (
                  <div key={f.key} className='space-y-2'>
                    <Label htmlFor={`cond-${f.key}`}>{f.label}</Label>
                    {f.type === 'switch' ? (
                      <Controller
                        name={`triggerCondition.${f.key}` as const}
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id={`cond-${f.key}`}
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    ) : (
                      <Input
                        id={`cond-${f.key}`}
                        type='number'
                        step='1'
                        min={f.min}
                        max={f.max}
                        placeholder={f.helperText}
                        {...register(`triggerCondition.${f.key}` as const, {
                          valueAsNumber: true
                        })}
                      />
                    )}
                    {f.helperText && f.type !== 'switch' && (
                      <p className='text-muted-foreground text-xs'>{f.helperText}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='space-y-3'>
            <Label>Audience filter</Label>
            <div className='grid gap-4 sm:grid-cols-2'>
              {AUDIENCE_FIELDS.map((f) => (
                <div key={f.key} className='space-y-2'>
                  <Label htmlFor={`aud-${f.key}`}>{f.label}</Label>
                  {f.type === 'switch' ? (
                    <Controller
                      name={`audienceFilter.${f.key}` as const}
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id={`aud-${f.key}`}
                          checked={Boolean(field.value)}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  ) : (
                    <Input
                      id={`aud-${f.key}`}
                      type='number'
                      step='1'
                      placeholder={f.helperText}
                      {...register(`audienceFilter.${f.key}` as const, {
                        valueAsNumber: true
                      })}
                    />
                  )}
                  {f.helperText && f.type !== 'switch' && (
                    <p className='text-muted-foreground text-xs'>{f.helperText}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
