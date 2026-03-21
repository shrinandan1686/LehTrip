import { onRequestDelete as __api_entries__id__js_onRequestDelete } from "/Users/shubhashreebhat/Documents/LehTrip/functions/api/entries/[id].js"
import { onRequestPut as __api_entries__id__js_onRequestPut } from "/Users/shubhashreebhat/Documents/LehTrip/functions/api/entries/[id].js"
import { onRequestPut as __api_notes__dayId__js_onRequestPut } from "/Users/shubhashreebhat/Documents/LehTrip/functions/api/notes/[dayId].js"
import { onRequestGet as __api_checklist_js_onRequestGet } from "/Users/shubhashreebhat/Documents/LehTrip/functions/api/checklist.js"
import { onRequestPost as __api_checklist_js_onRequestPost } from "/Users/shubhashreebhat/Documents/LehTrip/functions/api/checklist.js"
import { onRequestDelete as __api_entries_js_onRequestDelete } from "/Users/shubhashreebhat/Documents/LehTrip/functions/api/entries.js"
import { onRequestPost as __api_entries_js_onRequestPost } from "/Users/shubhashreebhat/Documents/LehTrip/functions/api/entries.js"
import { onRequestGet as __api_tracker_js_onRequestGet } from "/Users/shubhashreebhat/Documents/LehTrip/functions/api/tracker.js"

export const routes = [
    {
      routePath: "/api/entries/:id",
      mountPath: "/api/entries",
      method: "DELETE",
      middlewares: [],
      modules: [__api_entries__id__js_onRequestDelete],
    },
  {
      routePath: "/api/entries/:id",
      mountPath: "/api/entries",
      method: "PUT",
      middlewares: [],
      modules: [__api_entries__id__js_onRequestPut],
    },
  {
      routePath: "/api/notes/:dayId",
      mountPath: "/api/notes",
      method: "PUT",
      middlewares: [],
      modules: [__api_notes__dayId__js_onRequestPut],
    },
  {
      routePath: "/api/checklist",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_checklist_js_onRequestGet],
    },
  {
      routePath: "/api/checklist",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_checklist_js_onRequestPost],
    },
  {
      routePath: "/api/entries",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_entries_js_onRequestDelete],
    },
  {
      routePath: "/api/entries",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_entries_js_onRequestPost],
    },
  {
      routePath: "/api/tracker",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_tracker_js_onRequestGet],
    },
  ]