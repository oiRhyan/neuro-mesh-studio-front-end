'use client'

import { EnvironmentPanel } from '../Controls/EnvironmentPanel'
import { GenerationPanel } from '../Controls/GenerationPanel'
import { ModelList } from '../ModelList'
import { ModelToolbar } from './ModelToolbar'
import { ViewerCanvas } from './ViewerCanvas'
import { ViewerTopbar } from './ViewTopBar'

interface ModelViewerLayoutProps {
  modelUrl?: string
}

export function ModelViewerLayout({
  modelUrl
}: ModelViewerLayoutProps) {
  return (
    <section className="viewer-layout">

      <div className="viewer-container">

        <ViewerTopbar />

        <ViewerCanvas modelUrl={modelUrl} />

        <div className="left-panel">
          <ModelList />
          <GenerationPanel />
        </div>

        <EnvironmentPanel />

        <ModelToolbar />

      </div>

    </section>
  )
}