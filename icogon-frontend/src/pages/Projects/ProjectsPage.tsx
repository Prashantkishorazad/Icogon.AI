
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Clock3,
  FolderPlus,
  FolderOpen,
  Grid2X2,
  List,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  deleteProjectApi,
  getProjectsApi,
  type ProjectResponse,
} from "../../api/projectApi";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
type ViewMode = "grid" | "list";
type SortMode = "updated" | "oldest" | "name";

const PAGE_STYLE = `
.projects-page {
  --projects-bg: var(--background, #090B11);
--projects-panel: var(--card, #090B11);
--projects-text: var(--foreground, #f5f6fa);
--projects-muted: var(--muted-foreground, #858b9a);
--projects-border: var(--border, rgba(148, 163, 184, .16));
  min-height: 100%;
  color: var(--projects-text);
  background: var(--projects-bg);
}
.projects-page * { box-sizing: border-box; }
.projects-page__inner {
  width: min(100%, 1460px);
  margin: 0 auto;
  padding: clamp(18px, 2.4vw, 30px) clamp(16px, 2.2vw, 30px) 42px;
}
.projects-page__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}
.projects-page__heading {
  margin: 0;
  color: var(--projects-text);
  font-size: clamp(21px, 1.9vw, 25px);
  font-weight: 680;
  letter-spacing: -.045em;
}
.projects-page__actions { display: flex; align-items: center; gap: 10px; }
.projects-page__button {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid var(--projects-border);
  border-radius: 999px;
  color: var(--projects-text);
  background: color-mix(in srgb, var(--projects-text), var(--projects-panel) 65%, transparent);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease;
}
.projects-page__button:hover { transform: translateY(-1px); border-color: color-mix(in srgb, var(--projects-text)40%, var(--projects-border)); background: color-mix(in srgb, var(--projects-text)40%, var(--projects-panel) 65%, transparent); }
.projects-page__button:disabled { opacity: .55; cursor: wait; transform: none; }
.projects-page__button--primary {
  color: #ffffff;
  background: rgba(12, 14, 20, 0.85);
  border: 1px solid rgba(190, 195, 215, 0.48);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.025),
    0 8px 24px rgba(75, 91, 255, 0.12);
  transition: all 0.22s ease;
}

.projects-page__button--primary:hover {
  transform: translateY(-2px);
  color: #ffffff;
  background: #171923;
  border-color: rgba(170, 180, 220, 0.75);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.07),
    0 8px 28px rgba(77, 105, 255, 0.22),
    0 0 18px rgba(130, 91, 255, 0.12);
}

.projects-page__button--primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(75, 91, 255, 0.12);
}
.projects-page__button--primary:hover { box-shadow: 0 7px 24px rgba(76, 91, 245, .32), inset 0 1px rgba(255,255,255,.25); }
.projects-page__toolbar {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 13px;
}
.projects-page__search {
  display: flex;
  width: min(100%, 360px);
  min-height: 36px;
  align-items: center;
  gap: 9px;
  padding: 0 11px;
  border: 1px solid var(--projects-border);
  border-radius: 999px;
  color: var(--projects-muted);
  background: var(--projects-panel);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.projects-page__search:focus-within {
  border-color: color-mix(in srgb, #7770ff 65%, var(--projects-border));
  box-shadow: 0 0 0 3px rgba(111, 102, 255, .11);
}
.projects-page__search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  color: var(--projects-text);
  background: transparent;
  font: inherit;
  font-size: 11px;
}
.projects-page__search input::placeholder { color: var(--projects-muted); }
.projects-page__select {
  min-height: 36px;
  padding: 0 34px 0 14px;
  border: 1px solid var(--projects-border);
  border-radius: 999px;
  outline: 0;
  color: var(--projects-text);
  background: var(--projects-panel);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.projects-page__view-switch {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
  padding: 3px;
  border: 1px solid var(--projects-border);
  border-radius: 999px;
  background: var(--projects-panel);
}
.projects-page__view-button {
  display: grid;
  width: 31px;
  height: 29px;
  place-items: center;
  border: 0;
  border-radius: 999px;
  color: var(--projects-muted);
  background: transparent;
  cursor: pointer;
}
.projects-page__view-button[aria-pressed="true"] {
  color: var(--projects-text);
  background: color-mix(in srgb, var(--projects-text) 10%, transparent);
}
.projects-page__meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 37px;
  margin-bottom: 18px;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--projects-border) 75%, transparent);
  border-radius: 13px;
  background: color-mix(in srgb, var(--projects-panel) 65%, transparent);
}
.projects-page__filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 9px;
  border: 1px solid var(--projects-border);
  border-radius: 7px;
  color: var(--projects-muted);
  background: color-mix(in srgb, var(--projects-text) 4%, transparent);
  font-size: 10px;
}
.projects-page__filter-chip strong { color: var(--projects-text); font-weight: 600; }
.projects-page__owner-avatar {
  display: block;
  width: 23px;
  height: 23px;
  flex: 0 0 23px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 50%;
  object-fit: cover;
}
.projects-page__owner-avatar--fallback {
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #536fe8, #8654c8);
  font-size: 10px;
  font-weight: 700;
}
.projects-page__clear {
  border: 0;
  color: var(--projects-muted);
  background: transparent;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.projects-page__clear:hover { color: var(--projects-text); }
.projects-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 245px), 285px));
  align-items: start;
  gap: 18px 16px;
}
.projects-page__card-shell {
  position: relative;
  min-width: 0;
  padding: 1.5px;
  border-radius: 17px;
  background: linear-gradient(125deg, #788aff 0%, #a879f4 42%, #63cce5 72%, #8875f4 100%);
  box-shadow: 0 2px 10px rgba(105, 112, 255, .08);
  transition: transform .48s cubic-bezier(.2,.75,.25,1), box-shadow .48s ease;
  will-change: transform;
}
.projects-page__card-shell:hover {
  transform: translateY(-5px) scale(1.012);
  box-shadow: 0 14px 28px rgba(91, 83, 232, .16), 0 0 16px rgba(100, 113, 255, .10);
}
@media (prefers-reduced-motion: reduce) {
  .projects-page__card-shell { transition: none; }
  .projects-page__card-shell:hover { transform: none; }
}
.projects-page__card {
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-radius: 16px;
  color: var(--projects-text);
  background: var(--projects-panel);
}
.projects-page__thumbnail {
  position: relative;
  display: grid;
  height: 132px;
  overflow: hidden;
  place-items: center;
  isolation: isolate;
  background:
    radial-gradient(ellipse at 22% 18%, rgba(74, 119, 255, .26), transparent 42%),
    radial-gradient(ellipse at 82% 75%, rgba(157, 77, 239, .24), transparent 42%),
    linear-gradient(135deg, #171a29, #10121b 54%, #171326);
}
.projects-page__thumbnail-image {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform .6s ease;
}
.projects-page__thumbnail:hover .projects-page__thumbnail-image {
  transform: scale(1.035);
}
.projects-page__thumbnail-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, rgba(0,0,0,.04) 20%, rgba(0,0,0,.12) 55%, rgba(0,0,0,.58) 100%);
}
.projects-page__thumbnail::before,
.projects-page__thumbnail::after {
  position: absolute;
  z-index: -1;
  display: none;
  border: 1px solid rgba(190, 194, 255, .15);
  border-radius: 16px;
  content: "";
  transform: rotate(-13deg);
}
.projects-page__thumbnail::before { width: 74%; height: 62%; left: 13%; top: 22%; background: linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.015)); box-shadow: 0 20px 60px rgba(0,0,0,.25); }
.projects-page__thumbnail::after { width: 57%; height: 42%; left: 22%; top: 30%; border-color: rgba(125, 133, 255, .2); background: linear-gradient(135deg, rgba(79, 104, 255, .13), rgba(150, 85, 231, .09)); }
.projects-page__thumbnail-mark {
  display: grid;
  width: 47px;
  height: 47px;
  place-items: center;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 14px;
  color: rgba(255,255,255,.9);
  background: rgba(255,255,255,.08);
  box-shadow: 0 8px 28px rgba(0,0,0,.2);
  backdrop-filter: blur(12px);
  font-size: 19px;
  font-weight: 650;
}
.projects-page__thumbnail-label {
  position: absolute;
  z-index: 2;
  right: 13px;
  bottom: 11px;
  left: 13px;
  overflow: hidden;
  color: rgba(255,255,255,.68);
  font-size: 9px;
  letter-spacing: .12em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}
.projects-page__card-content { padding: 11px 12px 10px; }
.projects-page__card-title-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.projects-page__card-title {
  overflow: hidden;
  margin: 0;
  color: var(--projects-text);
  font-size: 13px;
  font-weight: 650;
  letter-spacing: -.015em;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.projects-page__more {
  display: grid;
  width: 27px;
  height: 27px;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  border-radius: 7px;
  color: var(--projects-muted);
  background: transparent;
  cursor: pointer;
}
.projects-page__more:hover { color: var(--projects-text); background: color-mix(in srgb, var(--projects-text) 8%, transparent); }
.projects-page__description {
  display: -webkit-box;
  min-height: 34px;
  overflow: hidden;
  margin: 5px 0 0;
  color: var(--projects-muted);
  font-size: 10px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.projects-page__card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  padding-top: 11px;
  border-top: 1px solid var(--projects-border);
}
.projects-page__date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--projects-muted);
  font-size: 9px;
}
.projects-page__open {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 0;
  color: var(--projects-muted);
  background: transparent;
  font: inherit;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}
.projects-page__open:hover { color: var(--projects-text); }
.projects-page__list { display: flex; flex-direction: column; gap: 9px; }
.projects-page__list-item {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 10px;
  border: 1px solid var(--projects-border);
  border-radius: 13px;
  background: var(--projects-panel);
  transition: border-color .15s ease;
}
.projects-page__list-item:hover { border-color: rgba(133, 115, 255, .5); }
.projects-page__list-thumb {
  display: grid;
  width: 62px;
  height: 48px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  color: white;
  background: linear-gradient(135deg, #273a76, #603c91 55%, #1a6676);
  font-size: 17px;
  font-weight: 650;
}
.projects-page__list-main { min-width: 0; flex: 1; }
.projects-page__list-title { overflow: hidden; margin: 0; font-size: 11px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.projects-page__list-desc { overflow: hidden; margin: 4px 0 0; color: var(--projects-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.projects-page__empty,
.projects-page__error {
  display: flex;
  min-height: 300px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;
  border: 1px dashed var(--projects-border);
  border-radius: 18px;
  text-align: center;
  background: color-mix(in srgb, var(--projects-panel) 60%, transparent);
}
.projects-page__empty-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid var(--projects-border);
  border-radius: 14px;
  color: #a69bff;
  background: color-mix(in srgb, #8778ff 12%, var(--projects-panel));
}
.projects-page__empty h2 { margin: 15px 0 0; font-size: 15px; font-weight: 650; }
.projects-page__empty p { max-width: 360px; margin: 6px 0 0; color: var(--projects-muted); font-size: 11px; line-height: 1.65; }
.projects-page__skeleton {
  height: 226px;
  overflow: hidden;
  border: 1px solid var(--projects-border);
  border-radius: 17px;
  background: var(--projects-panel);
}
.projects-page__skeleton-thumb { height: 132px; background: linear-gradient(100deg, color-mix(in srgb, var(--projects-text) 4%, transparent) 20%, color-mix(in srgb, var(--projects-text) 8%, transparent) 38%, color-mix(in srgb, var(--projects-text) 4%, transparent) 56%); background-size: 200% 100%; animation: projects-shimmer 1.4s ease infinite; }
.projects-page__skeleton-line { height: 9px; margin: 17px 15px 0; border-radius: 10px; background: color-mix(in srgb, var(--projects-text) 7%, transparent); }
@keyframes projects-shimmer { to { background-position-x: -200%; } }

/* Animated first-project experience */
.projects-page__welcome {
  position: relative;
  display: flex;
  min-height: 390px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  isolation: isolate;
  padding: 42px 20px;
  border: 1px solid color-mix(in srgb, var(--projects-border) 72%, transparent);
  border-radius: 20px;
  text-align: center;
  background:
    radial-gradient(ellipse at 50% 38%, rgba(119, 103, 255, .10), transparent 42%),
    color-mix(in srgb, var(--projects-panel) 38%, transparent);
}
.projects-page__welcome-glow {
  position: absolute;
  z-index: -1;
  top: 50%;
  left: 50%;
  width: 330px;
  height: 250px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(112, 99, 255, .19), rgba(71, 178, 230, .07) 48%, transparent 72%);
  filter: blur(18px);
  transform: translate(-50%, -62%);
  animation: projects-welcome-glow 4s ease-in-out infinite;
}
.projects-page__welcome-art {
  position: relative;
  display: grid;
  width: 176px;
  height: 142px;
  place-items: center;
  margin-bottom: 20px;
}
.projects-page__welcome-window {
  position: absolute;
  display: flex;
  width: 112px;
  height: 84px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(151, 142, 255, .42);
  border-radius: 15px;
  color: #a99cff;
  background: color-mix(in srgb, var(--projects-panel) 88%, #7468ff 12%);
  box-shadow: 0 12px 38px rgba(89, 79, 205, .16), inset 0 1px rgba(255,255,255,.12);
  animation: projects-welcome-float 3.6s ease-in-out infinite;
}
.projects-page__welcome-window::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 17px;
  border-bottom: 1px solid rgba(151, 142, 255, .18);
  border-radius: 14px 14px 0 0;
  background: rgba(151, 142, 255, .08);
  content: "";
}
.projects-page__welcome-window svg { margin-top: 12px; }
.projects-page__welcome-plus {
  position: absolute;
  right: 18px;
  bottom: 13px;
  display: grid;
  width: 35px;
  height: 35px;
  place-items: center;
  border: 1px solid rgba(255,255,255,.35);
  border-radius: 11px;
  color: #fff;
  background: linear-gradient(135deg, #6878ff, #9860e9);
  box-shadow: 0 7px 22px rgba(111, 94, 245, .35);
  animation: projects-welcome-pulse 2.2s ease-in-out infinite;
}
.projects-page__welcome-spark {
  position: absolute;
  color: #a99cff;
  animation: projects-welcome-twinkle 2.4s ease-in-out infinite;
}
.projects-page__welcome-spark--one { top: 12px; left: 17px; }
.projects-page__welcome-spark--two { top: 30px; right: 12px; animation-delay: .7s; }
.projects-page__welcome-spark--three { bottom: 8px; left: 24px; animation-delay: 1.2s; }
.projects-page__welcome-title {
  margin: 0;
  color: var(--projects-text);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -.035em;
}
.projects-page__welcome-copy {
  max-width: 390px;
  margin: 9px 0 0;
  color: var(--projects-muted);
  font-size: 12px;
  line-height: 1.7;
}
.projects-page__welcome-cta {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-top: 22px;
  padding: 0 19px;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(110deg, #526fff, #8658e9);
  box-shadow: 0 8px 24px rgba(91, 91, 232, .25);
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease;
  animation: projects-welcome-cta 2.8s ease-in-out infinite;
}
.projects-page__welcome-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(91, 91, 232, .36);
}
.projects-page__welcome-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  color: var(--projects-muted);
  font-size: 10px;
  opacity: .8;
}
@keyframes projects-welcome-float {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
}
@keyframes projects-welcome-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 7px 22px rgba(111, 94, 245, .30); }
  50% { transform: scale(1.09); box-shadow: 0 9px 28px rgba(111, 94, 245, .48); }
}
@keyframes projects-welcome-twinkle {
  0%, 100% { opacity: .35; transform: scale(.8); }
  50% { opacity: 1; transform: scale(1.18); }
}
@keyframes projects-welcome-glow {
  0%, 100% { opacity: .55; transform: translate(-50%, -62%) scale(.9); }
  50% { opacity: 1; transform: translate(-50%, -62%) scale(1.12); }
}
@keyframes projects-welcome-cta {
  0%, 75%, 100% { box-shadow: 0 8px 24px rgba(91, 91, 232, .23); }
  85% { box-shadow: 0 8px 32px rgba(91, 91, 232, .42), 0 0 0 5px rgba(127, 105, 255, .08); }
}
@media (prefers-reduced-motion: reduce) {
  .projects-page__welcome *,
  .projects-page__welcome::before {
    animation: none !important;
    transition: none !important;
  }
}
.projects-page__menu-wrap { position: relative; }
.projects-page__menu {
  position: absolute;
  z-index: 5;
  top: 32px;
  right: 0;
  min-width: 135px;
  padding: 5px;
  border: 1px solid var(--projects-border);
  border-radius: 10px;
  background: var(--projects-panel);
  box-shadow: 0 12px 35px rgba(0,0,0,.22);
}
.projects-page__menu button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 0;
  border-radius: 6px;
  color: var(--projects-text);
  background: transparent;
  font: inherit;
  font-size: 10px;
  text-align: left;
  cursor: pointer;
}
.projects-page__menu button:hover { background: color-mix(in srgb, var(--projects-text) 7%, transparent); }
@media (max-width: 650px) {
  .projects-page__inner { padding: 22px 15px 40px; }
  .projects-page__top { align-items: flex-start; margin-bottom: 22px; }
  .projects-page__button--folder { display: none; }
  .projects-page__button { min-height: 36px; padding: 0 12px; font-size: 11px; }
  .projects-page__toolbar { flex-wrap: wrap; }
  .projects-page__search { width: 100%; flex-basis: 100%; }
  .projects-page__select { flex: 1; }
  .projects-page__meta-row { margin-bottom: 18px; }
  .projects-page__grid { grid-template-columns: 1fr; }
  .projects-page__thumbnail { height: 185px; }
}
`;


const PROJECT_PREVIEW_IMAGES = {
  commerce: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=82",
  photography: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=82",
  portfolio: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=82",
  food: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=82",
  property: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=82",
  fitness: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=82",
  analytics: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=82",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=82",
  default: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=82",
};

function getProjectPreviewImage(project: ProjectResponse): string {
  const text = `${project.name ?? ""} ${project.description ?? ""}`.toLowerCase();

  if (/photo|photography|camera|gallery|portrait/.test(text)) return PROJECT_PREVIEW_IMAGES.photography;
  if (/portfolio|artist|creative|designer|agency/.test(text)) return PROJECT_PREVIEW_IMAGES.portfolio;
  if (/shop|store|ecommerce|e-commerce|cart|product|marketplace/.test(text)) return PROJECT_PREVIEW_IMAGES.commerce;
  if (/restaurant|food|cafe|coffee|menu|hotel/.test(text)) return PROJECT_PREVIEW_IMAGES.food;
  if (/real estate|property|house|home|interior|architecture/.test(text)) return PROJECT_PREVIEW_IMAGES.property;
  if (/fitness|gym|workout|health|yoga/.test(text)) return PROJECT_PREVIEW_IMAGES.fitness;
  if (/dashboard|analytics|admin|data|report|crm/.test(text)) return PROJECT_PREVIEW_IMAGES.analytics;
  if (/ai|saas|tech|software|app|platform|developer/.test(text)) return PROJECT_PREVIEW_IMAGES.technology;
  return PROJECT_PREVIEW_IMAGES.default;
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("updated");
  const [view, setView] = useState<ViewMode>("grid");
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentTime] = useState(() => Date.now());
  const [profileName, setProfileName] = useState("Your account");
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const data = await getProjectsApi();
      setProjects(data);
    } catch (err: unknown) {
      console.error("Failed to load projects:", err);
      const apiError = err as {
        response?: { data?: { detail?: unknown } };
        message?: unknown;
      };
      const detail = apiError.response?.data?.detail;
      setError(
        (typeof detail === "string" && detail) ||
          (typeof apiError.message === "string" && apiError.message) ||
          "Failed to load projects.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadProjects);

    const updateProfile = (user: {
      email?: string;
      user_metadata?: Record<string, unknown>;
    } | null) => {
      if (!user) {
        setProfileName("Your account");
        setProfileAvatar(null);
        return;
      }

      const metadata = user.user_metadata ?? {};
      const name =
        (typeof metadata.full_name === "string" && metadata.full_name) ||
        (typeof metadata.name === "string" && metadata.name) ||
        (typeof metadata.display_name === "string" && metadata.display_name) ||
        user.email?.split("@")[0] ||
        "Your account";

      const avatar =
        (typeof metadata.avatar_url === "string" && metadata.avatar_url) ||
        (typeof metadata.picture === "string" && metadata.picture) ||
        (typeof metadata.profile_image === "string" && metadata.profile_image) ||
        null;

      setProfileName(name);
      setProfileAvatar(avatar);
    };

    void supabase.auth.getUser().then(({ data, error: authError }) => {
      if (authError) {
        console.warn("Unable to load user profile:", authError.message);
        return;
      }
      updateProfile(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      updateProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [loadProjects]);

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = projects.filter((project) => {
      const name = project.name ?? "";
      const description = project.description ?? "";
      return `${name} ${description}`.toLowerCase().includes(query);
    });

    return [...filtered].sort((a, b) => {
      if (sort === "name") return (a.name ?? "").localeCompare(b.name ?? "");
      const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
      const bDate = new Date(b.updated_at || b.created_at || 0).getTime();
      return sort === "oldest" ? aDate - bDate : bDate - aDate;
    });
  }, [projects, search, sort]);

  const handleDelete = async (projectId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this project?");
    if (!confirmed) return;

    try {
      setDeletingId(projectId);
      await deleteProjectApi(projectId);
      setProjects((current) => current.filter((project) => project.id !== projectId));
      setMenuProjectId(null);
    } catch (err: unknown) {
      console.error("Failed to delete project:", err);
      const apiError = err as {
        response?: { data?: { detail?: unknown } };
        message?: unknown;
      };
      const detail = apiError.response?.data?.detail;
      window.alert(
        (typeof detail === "string" && detail) ||
          (typeof apiError.message === "string" && apiError.message) ||
          "Failed to delete project.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (project: ProjectResponse) => {
    const value = project.updated_at || project.created_at;
    if (!value || currentTime === 0) return "Recently edited";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently edited";

    const elapsed = currentTime - date.getTime();
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (elapsed >= 0 && elapsed < minute) return "Edited just now";
    if (elapsed >= minute && elapsed < hour) {
      const amount = Math.floor(elapsed / minute);
      return `Edited ${amount} min${amount === 1 ? "" : "s"} ago`;
    }
    if (elapsed >= hour && elapsed < day) {
      const amount = Math.floor(elapsed / hour);
      return `Edited ${amount} hour${amount === 1 ? "" : "s"} ago`;
    }
    if (elapsed >= day && elapsed < 7 * day) {
      const amount = Math.floor(elapsed / day);
      return `Edited ${amount} day${amount === 1 ? "" : "s"} ago`;
    }
    return `Edited ${date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  const getInitial = (name?: string) => name?.trim().charAt(0).toUpperCase() || "P";

  const openProject = (projectId: string) => navigate(`/builder/${projectId}`);

  return (
    <div className={`projects-page ${isDark ? "projects-page--dark" : "projects-page--light"}`}>
      <style>{PAGE_STYLE}</style>

      <main className="projects-page__inner">
        <header className="projects-page__top">
          <h1 className="projects-page__heading">Projects</h1>
          <div className="projects-page__actions">
            <button
              type="button"
              className="projects-page__button projects-page__button--folder"
              disabled
              title="Folder management is not implemented yet"
            >
              <FolderPlus size={14} />
              New folder
            </button>
            <button
              type="button"
              className="projects-page__button projects-page__button--primary"
              onClick={() => navigate("/builder")}
            >
              <Plus size={15} />
              New project
            </button>
          </div>
        </header>

        <section className="projects-page__toolbar" aria-label="Project controls">
          <label className="projects-page__search">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects..."
              aria-label="Search projects"
            />
            {search && (
              <button
                type="button"
                className="projects-page__clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </label>

          <select
            className="projects-page__select"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
            aria-label="Sort projects"
          >
            <option value="updated">Recently edited</option>
            <option value="oldest">Oldest edited</option>
            <option value="name">Name A–Z</option>
          </select>

          <div className="projects-page__view-switch" role="group" aria-label="Project view">
            <button
              type="button"
              className="projects-page__view-button"
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <Grid2X2 size={14} />
            </button>
            <button
              type="button"
              className="projects-page__view-button"
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List size={15} />
            </button>
          </div>

          <button
            type="button"
            className="projects-page__button"
            onClick={() => void loadProjects()}
            disabled={loading}
            title="Refresh projects"
            style={{ width: 41, padding: 0 }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </section>

        <div className="projects-page__meta-row">
          <div className="projects-page__filter-chip">
            {profileAvatar ? (
              <img
                className="projects-page__owner-avatar"
                src={profileAvatar}
                alt={`${profileName} profile`}
                referrerPolicy="no-referrer"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="projects-page__owner-avatar projects-page__owner-avatar--fallback">
                {profileName.trim().charAt(0).toUpperCase() || "U"}
              </span>
            )}
            <span>{search ? "Search" : "Owner"}</span>
            <strong>{search ? `“${search}”` : profileName}</strong>
            {search && (
              <button
                type="button"
                className="projects-page__clear"
                onClick={() => setSearch("")}
                aria-label="Remove search filter"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <span style={{ color: "var(--projects-muted)", fontSize: 10 }}>
            {visibleProjects.length} {visibleProjects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        {error && !loading && (
          <section className="projects-page__error" role="alert">
            <div className="projects-page__empty-icon"><FolderOpen size={20} /></div>
            <h2 style={{ margin: "14px 0 0", fontSize: 14, fontWeight: 650 }}>Unable to load projects</h2>
            <p style={{ margin: "6px 0 0", color: "var(--projects-muted)", fontSize: 11 }}>{error}</p>
            <button
              type="button"
              className="projects-page__button"
              style={{ marginTop: 16 }}
              onClick={() => void loadProjects()}
            >
              <RefreshCw size={13} /> Try again
            </button>
          </section>
        )}

        {loading && (
          <div className="projects-page__grid" aria-label="Loading projects">
            {[0, 1, 2, 3].map((item) => (
              <div className="projects-page__skeleton" key={item}>
                <div className="projects-page__skeleton-thumb" />
                <div className="projects-page__skeleton-line" style={{ width: "58%" }} />
                <div className="projects-page__skeleton-line" style={{ width: "76%", marginTop: 9 }} />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && visibleProjects.length === 0 && projects.length === 0 && (
          <section className="projects-page__welcome" aria-labelledby="projects-welcome-title">
            <div className="projects-page__welcome-glow" aria-hidden="true" />
            <div className="projects-page__welcome-art" aria-hidden="true">
              <span className="projects-page__welcome-spark projects-page__welcome-spark--one">✦</span>
              <span className="projects-page__welcome-spark projects-page__welcome-spark--two">✧</span>
              <span className="projects-page__welcome-spark projects-page__welcome-spark--three">✦</span>
              <div className="projects-page__welcome-window">
                <FolderOpen size={35} strokeWidth={1.6} />
              </div>
              <span className="projects-page__welcome-plus"><Plus size={20} /></span>
            </div>
            <h2 className="projects-page__welcome-title" id="projects-welcome-title">
              Your next idea starts here
            </h2>
            <p className="projects-page__welcome-copy">
              Turn your idea into a real website. Start with one prompt and let ICOGON help you build it.
            </p>
            <button
              type="button"
              className="projects-page__welcome-cta"
              onClick={() => navigate("/builder")}
            >
              <Plus size={16} /> Create your first project <ArrowRight size={15} />
            </button>
            <span className="projects-page__welcome-hint">Your workspace is ready when you are</span>
          </section>
        )}

        {!loading && !error && visibleProjects.length === 0 && projects.length > 0 && (
          <section className="projects-page__empty">
            <div className="projects-page__empty-icon"><Search size={20} /></div>
            <h2>No matching projects</h2>
            <p>Try another project name or clear your search to see all projects.</p>
            <button
              type="button"
              className="projects-page__button"
              style={{ marginTop: 18 }}
              onClick={() => setSearch("")}
            >
              Clear search
            </button>
          </section>
        )}

        {!loading && !error && visibleProjects.length > 0 && view === "grid" && (
          <section className="projects-page__grid" aria-label="Projects">
            {visibleProjects.map((project) => (
              <div className="projects-page__card-shell" key={project.id}>
                <article className="projects-page__card">
                  <button
                    type="button"
                    className="projects-page__thumbnail"
                    onClick={() => openProject(project.id)}
                    aria-label={`Open ${project.name}`}
                  >
                    <img
                      className="projects-page__thumbnail-image"
                      src={getProjectPreviewImage(project)}
                      alt={`${project.name} project preview`}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                    <span className="projects-page__thumbnail-overlay" />
                    <span className="projects-page__thumbnail-label">{project.name}</span>
                  </button>

                  <div className="projects-page__card-content">
                    <div className="projects-page__card-title-row">
                      <h2 className="projects-page__card-title" title={project.name}>{project.name}</h2>
                      <div className="projects-page__menu-wrap">
                        <button
                          type="button"
                          className="projects-page__more"
                          aria-label={`More actions for ${project.name}`}
                          aria-expanded={menuProjectId === project.id}
                          onClick={() => setMenuProjectId((current) => current === project.id ? null : project.id)}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {menuProjectId === project.id && (
                          <div className="projects-page__menu">
                            <button type="button" onClick={() => openProject(project.id)}>
                              <ArrowRight size={12} /> Open project
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === project.id}
                              onClick={() => void handleDelete(project.id)}
                              style={{ color: "#ed6b76" }}
                            >
                              <Trash2 size={12} /> {deletingId === project.id ? "Deleting..." : "Delete project"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="projects-page__description">
                      {project.description || "Your ICOGON AI project workspace."}
                    </p>

                    <div className="projects-page__card-footer">
                      <span className="projects-page__date">
                        <Clock3 size={11} /> {formatDate(project)}
                      </span>
                      <button type="button" className="projects-page__open" onClick={() => openProject(project.id)}>
                        Open <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </section>
        )}

        {!loading && !error && visibleProjects.length > 0 && view === "list" && (
          <section className="projects-page__list" aria-label="Projects">
            {visibleProjects.map((project) => (
              <article className="projects-page__list-item" key={project.id}>
                <div className="projects-page__list-thumb">{getInitial(project.name)}</div>
                <div className="projects-page__list-main">
                  <h2 className="projects-page__list-title">{project.name}</h2>
                  <p className="projects-page__list-desc">{project.description || "Your ICOGON AI project workspace."}</p>
                </div>
                <span className="projects-page__date"><Clock3 size={11} /> {formatDate(project)}</span>
                <button type="button" className="projects-page__open" onClick={() => openProject(project.id)}>
                  Open <ArrowRight size={12} />
                </button>
                <button
                  type="button"
                  className="projects-page__more"
                  aria-label={`Delete ${project.name}`}
                  disabled={deletingId === project.id}
                  onClick={() => void handleDelete(project.id)}
                >
                  <Trash2 size={14} />
                </button>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;
