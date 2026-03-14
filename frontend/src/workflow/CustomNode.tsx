import { Handle, Position } from '@xyflow/react';

export function CustomNode({ data }: { data: any }) {
  return (
    <div style={{
      padding: '10px',
      border: '1px solid #222',
      borderRadius: '3px',
      backgroundColor: '#fff',
      minWidth: '100px',
      textAlign: 'center'
    }}>
      <Handle type="target" position={Position.Top} />
      {data.label}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
