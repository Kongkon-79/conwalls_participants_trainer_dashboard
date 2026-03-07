// declare module 'html2pdf.js' {
//   type Html2PdfInstance = {
//     set: (opt: unknown) => Html2PdfInstance
//     from: (element: HTMLElement) => Html2PdfInstance
//     save: (filename?: string) => Promise<void>
//     outputPdf?: (type?: string) => Promise<unknown>
//   }

//   interface Html2PdfFactory {
//     (): Html2PdfInstance
//   }

//   const html2pdf: Html2PdfFactory
//   export default html2pdf
// }



declare module 'html2pdf.js' {
export  interface Html2PdfOptions {
    margin?: number | number[]
    filename?: string
    image?: {
      type?: 'jpeg' | 'png' | 'webp'
      quality?: number
    }
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      backgroundColor?: string
      width?: number
      windowWidth?: number
      scrollX?: number
      scrollY?: number
    }
    jsPDF?: {
      unit?: 'mm' | 'cm' | 'in' | 'px' | 'pt'
      format?: 'a3' | 'a4' | string
      orientation?: 'portrait' | 'landscape'
    }
    pagebreak?: {
      mode?: readonly string[]
    }
  }

  interface Html2PdfInstance {
    set: (opt: Html2PdfOptions) => Html2PdfInstance
    from: (element: HTMLElement) => Html2PdfInstance
    save: () => Promise<void>
  }

  interface Html2PdfFactory {
    (): Html2PdfInstance
  }

  const html2pdf: Html2PdfFactory
  export default html2pdf
}



// declare module 'html2pdf.js' {
//   interface Html2PdfOptions {
//     margin?: number | number[]
//     filename?: string
//     image?: {
//       type?: 'jpeg' | 'png' | 'webp'
//       quality?: number
//     }
//     html2canvas?: {
//       scale?: number
//       useCORS?: boolean
//       backgroundColor?: string
//       width?: number
//       windowWidth?: number
//       scrollX?: number
//       scrollY?: number
//     }
//     jsPDF?: {
//       unit?: 'mm' | 'cm' | 'in' | 'px' | 'pt'
//       format?: 'a3' | 'a4' | string
//       orientation?: 'portrait' | 'landscape'
//     }
//     pagebreak?: {
//       mode?: readonly string[]
//     }
//   }

//   interface Html2PdfInstance {
//     set: (opt: Html2PdfOptions) => Html2PdfInstance
//     from: (element: HTMLElement) => Html2PdfInstance
//     save: () => Promise<void>
//   }

//   interface Html2PdfFactory {
//     (): Html2PdfInstance
//   }

//   const html2pdf: Html2PdfFactory
//   export default html2pdf
// }