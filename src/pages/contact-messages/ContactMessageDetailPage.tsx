import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDataProvider,
  useGetList,
  useGetOne,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MessageSquareText,
  NotebookPen,
  Phone,
  Send,
  Tag,
  User as UserIcon,
} from "lucide-react";

import { DateField } from "@/components/admin/date-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ExtendedDataProvider } from "@/providers/dataProvider";
import { MessageStatusBadge } from "./MessageBadges";
import {
  type ContactMessageStatus,
  type ContactReplyRecord,
  MESSAGE_STATUSES,
} from "./messageStatus";

const gmailHref = (to: string, subject: string, body: string) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

const mailtoHref = (to: string, subject: string, body: string) =>
  `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

const waHref = (phone: string, body: string) =>
  `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(body)}`;

const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;

export default function ContactMessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider<ExtendedDataProvider>();

  const { data: record, isLoading } = useGetOne(
    "contact-messages",
    { id: id as string },
    { enabled: Boolean(id), onError: () => navigate("/contact-messages") },
  );

  const { data: templates } = useGetList("contact-templates", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "sortOrder", order: "ASC" },
  });

  const { data: motives } = useGetList("contact-motives", {
    filter: { category: "contact-motive" },
    pagination: { page: 1, perPage: 100 },
    sort: { field: "sortOrder", order: "ASC" },
  });

  const { data: config } = useQuery({
    queryKey: ["contact-config"],
    queryFn: () => dataProvider.getContactConfig(),
    staleTime: 5 * 60_000,
  });
  const platformReplyEnabled = config?.data.platformReplyEnabled ?? false;

  const [templateId, setTemplateId] = useState("");
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");

  const activeTemplates = useMemo(
    () => (templates ?? []).filter((t) => t.isActive !== false),
    [templates],
  );

  const motiveLabel = (motiveId: unknown) =>
    (motives ?? []).find((m) => m.id === motiveId)?.label as
      | string
      | undefined;

  const onTemplateChange = (value: string) => {
    setTemplateId(value);
    const template = activeTemplates.find((t) => t.id === value);
    if (template) setBody(template.body as string);
  };

  const logReply = useMutation({
    mutationFn: (payload: {
      channel: string;
      templateId?: string;
      body?: string;
    }) => dataProvider.postContactReply(id as string, payload),
    onSuccess: () => {
      notify("contact-messages.reply_logged", { type: "info" });
      setNote("");
      refresh();
    },
    onError: (error: unknown) => {
      const backendMessage = (
        error as { body?: { error?: { message?: string } } }
      )?.body?.error?.message;
      notify(backendMessage ?? translate("shared.actions.error"), {
        type: "error",
      });
    },
  });

  const changeStatus = useMutation({
    mutationFn: (status: string) =>
      dataProvider.updateContactMessageStatus(id as string, status),
    onSuccess: () => refresh(),
    onError: () => notify(translate("shared.actions.error"), { type: "error" }),
  });

  if (isLoading || !record) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-muted-foreground">
        {translate("ra.page.loading", { _: "Cargando" })}…
      </div>
    );
  }

  const fullName =
    [record.name, record.lastName].filter(Boolean).join(" ") || "—";
  const email = record.email as string | null;
  const phone = record.phone as string | null;
  const replies = (record.replies ?? []) as ContactReplyRecord[];
  const replyBody = body.trim();
  const subject = translate("contact-messages.reply_subject", {
    _: "Respuesta a tu mensaje — Maxi",
  });

  const recordAction = (channel: string) => {
    logReply.mutate({
      channel,
      templateId: templateId || undefined,
      body: replyBody || undefined,
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <Link
        to="/contact-messages"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {translate("resources.contact-messages.name_plural")}
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquareText className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {fullName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {(record.motiveLabel as string) ?? ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MessageStatusBadge
            status={record.status as ContactMessageStatus}
          />
          <select
            value={record.status as string}
            onChange={(event) => changeStatus.mutate(event.target.value)}
            disabled={changeStatus.isPending}
            aria-label={translate("list.fields.status")}
            className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          >
            {MESSAGE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {translate(`contact-messages.status.${status}`, { _: status })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-border p-5">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              {translate("contact-messages.fields.message")}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {record.message as string}
            </p>
          </section>

          <section className="rounded-xl border border-border p-5">
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
              {translate("contact-messages.reply_title")}
            </h2>

            <div className="flex flex-col gap-3">
              <select
                value={templateId}
                onChange={(event) => onTemplateChange(event.target.value)}
                aria-label={translate("resources.contact-templates.name")}
                className="h-10 rounded-md border border-border bg-background px-2 text-sm"
              >
                <option value="">
                  {translate("contact-messages.template_placeholder")}
                </option>
                {activeTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {`${template.title as string} — ${
                      motiveLabel(template.motiveId) ??
                      translate("contact-templates.any_motive")
                    }`}
                  </option>
                ))}
              </select>

              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={6}
                placeholder={translate("contact-messages.body_placeholder")}
              />

              <div className="flex flex-wrap gap-2">
                {email && (
                  <>
                    <a
                      href={mailtoHref(email, subject, replyBody)}
                      onClick={() => recordAction("email")}
                      className={cn(buttonVariants({ variant: "outline" }))}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </a>
                    <a
                      href={gmailHref(email, subject, replyBody)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => recordAction("email")}
                      className={cn(buttonVariants({ variant: "outline" }))}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Gmail
                    </a>
                  </>
                )}
                {phone && (
                  <>
                    <a
                      href={waHref(phone, replyBody)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => recordAction("whatsapp")}
                      className={cn(buttonVariants({ variant: "outline" }))}
                    >
                      <MessageSquareText className="mr-2 h-4 w-4" />
                      WhatsApp
                    </a>
                    <a
                      href={telHref(phone)}
                      onClick={() => recordAction("telefono")}
                      className={cn(buttonVariants({ variant: "outline" }))}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      {translate("contact-messages.call")}
                    </a>
                  </>
                )}
                <Button
                  type="button"
                  disabled={!platformReplyEnabled || logReply.isPending}
                  title={
                    platformReplyEnabled
                      ? undefined
                      : translate("contact-messages.platform_disabled")
                  }
                  onClick={() => recordAction("plataforma")}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {translate("contact-messages.platform_send")}
                </Button>
              </div>
              {!platformReplyEnabled && (
                <p className="text-xs text-muted-foreground">
                  {translate("contact-messages.platform_disabled")}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border p-5">
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
              {translate("contact-messages.note_title")}
            </h2>
            <div className="flex flex-col gap-3">
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                placeholder={translate("contact-messages.note_placeholder")}
              />
              <Button
                type="button"
                variant="outline"
                className="self-start"
                disabled={!note.trim() || logReply.isPending}
                onClick={() =>
                  logReply.mutate({ channel: "nota", body: note.trim() })
                }
              >
                <NotebookPen className="mr-2 h-4 w-4" />
                {translate("contact-messages.note_save")}
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-border p-5">
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
              {translate("contact-messages.history_title")}
            </h2>
            {replies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {translate("contact-messages.history_empty")}
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {replies.map((reply) => (
                  <li
                    key={reply.id}
                    className="rounded-lg border border-border/60 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {translate(
                          `contact-messages.channel.${reply.channel}`,
                          { _: reply.channel },
                        )}
                      </span>
                      <span>·</span>
                      <span>{reply.userName ?? "—"}</span>
                      <span>·</span>
                      <DateField record={reply} source="createdAt" showTime />
                    </div>
                    {reply.body && (
                      <p className="mt-2 whitespace-pre-line text-sm text-foreground">
                        {reply.body}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-border p-5">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
            {translate("contact-messages.sender_title")}
          </h2>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span>{fullName}</span>
            </li>
            {email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${email}`} className="hover:underline">
                  {email}
                </a>
              </li>
            )}
            {phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={telHref(phone)} className="hover:underline">
                  {phone}
                </a>
              </li>
            )}
            <li className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span>{(record.motiveLabel as string) ?? "—"}</span>
            </li>
            <li className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <DateField source="createdAt" record={record} showTime />
            </li>
            {record.clientId ? (
              <li>
                <Link
                  to={`/clients/${record.clientId as string}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-2",
                  )}
                >
                  {translate("contact-messages.view_client")}
                </Link>
              </li>
            ) : (
              <li className="text-xs text-muted-foreground">
                {translate("contact-messages.anonymous_sender")}
              </li>
            )}
          </ul>
        </aside>
      </div>
    </div>
  );
}
