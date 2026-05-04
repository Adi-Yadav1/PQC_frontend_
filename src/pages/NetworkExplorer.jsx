/**
 * NetworkExplorer.jsx — Visual representation of the blockchain
 */

import React, { useEffect, useState, useMemo } from 'react'
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow'
import 'reactflow/dist/style.css'
import { useBlockchain } from '../context/BlockchainContext'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'

export default function NetworkExplorer() {
  const { blocks, fetchBlocks, loading } = useBlockchain()
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])

  useEffect(() => {
    fetchBlocks()
  }, [fetchBlocks])

  useEffect(() => {
    if (blocks.length > 0) {
      const newNodes = blocks.map((block, i) => ({
        id: block.hash,
        position: { x: i * 250 + 50, y: 150 },
        data: { 
          label: (
            <div style={{ padding: '8px', textAlign: 'center' }}>
              <strong style={{ color: 'var(--color-cyan)', fontSize: '1.1rem' }}>Block #{block.index}</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '8px 0' }} className="mono">
                {block.hash.substring(0, 12)}...
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                Txns: <strong style={{ color: 'var(--color-purple)' }}>{block.transactions?.length || 0}</strong>
              </div>
            </div>
          )
        },
        style: {
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          width: 180,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }
      }))

      const newEdges = blocks.map((block, i) => {
        if (i === 0) return null
        return {
          id: `e-${blocks[i-1].hash}-${block.hash}`,
          source: blocks[i-1].hash,
          target: block.hash,
          animated: true,
          style: { stroke: 'var(--color-purple)', strokeWidth: 2 }
        }
      }).filter(Boolean)

      setNodes(newNodes)
      setEdges(newEdges)
    }
  }, [blocks])

  if (loading && blocks.length === 0) {
    return <LoadingSpinner message="Loading network..." />
  }

  return (
    <main className="page-content animate-fade-in">
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>🌐 Network Explorer</h1>
            <p>Interactive visualization of the PQC blockchain.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => fetchBlocks()}>
            🔄 Refresh Chain
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: '70vh', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
        >
          <Background color="var(--color-border)" gap={16} size={1} />
          <Controls style={{ backgroundColor: 'var(--color-surface)', fill: 'var(--color-text)' }} />
          <MiniMap 
            nodeColor="var(--color-cyan)" 
            nodeBorderRadius={8}
            maskColor="rgba(10, 10, 18, 0.7)"
            style={{ backgroundColor: 'var(--color-surface)' }}
          />
        </ReactFlow>
      </div>
    </main>
  )
}
