import React, { useState } from "react";

const DemoContainer:React.FC<{
  Cmp?: React.ReactElement
  children?: React.ReactNode
}> = ({ children, Cmp }) => {
  const [visible, setVisible] = useState(false)
  if (!Cmp) {
    return null
  }
  
  return (
    <div className="">
      <button onClick={() => {
        setVisible(!visible)
      }}>{visible?'隐藏': '显示'}结果</button>
      {visible && <div 
        style={{
          padding: `10px 0`,
        }}
      >
        <Cmp />
      </div>}
    </div>
  )
}
export default DemoContainer