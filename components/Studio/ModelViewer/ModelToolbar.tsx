import {
  RotateCcw,
  Sun,
  User,
  Download
} from 'lucide-react'

export function ModelToolbar() {
  return (
    <div className="viewer-toolbar">

      <button>
        <RotateCcw size={20} />
      </button>

      <button>
        <Sun size={20} />
      </button>

      <button>
        <User size={20} />
      </button>

      <button>
        <Download size={20} />
      </button>

    </div>
  )
}