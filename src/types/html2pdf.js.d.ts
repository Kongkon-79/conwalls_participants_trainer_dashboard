declare module 'html2pdf.js' {
  type Html2PdfInstance = {
    set: (opt: unknown) => Html2PdfInstance
    from: (element: HTMLElement) => Html2PdfInstance
    save: (filename?: string) => Promise<void>
    outputPdf?: (type?: string) => Promise<unknown>
  }

  interface Html2PdfFactory {
    (): Html2PdfInstance
  }

  const html2pdf: Html2PdfFactory
  export default html2pdf
}