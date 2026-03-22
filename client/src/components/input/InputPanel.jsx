import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import DirectionSelector from './DirectionSelector';
import TextPasteInput from './TextPasteInput';
import ImageUploadInput from './ImageUploadInput';

export default function InputPanel({ onConvert }) {
  return (
    <Card className="flex flex-col py-4">
      <CardHeader className="px-4">
        <CardTitle>Input</CardTitle>
        <CardDescription>Paste or upload your cash flow statement to convert between IFRS and US GAAP</CardDescription>
        <DirectionSelector />
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="text">Text Paste</TabsTrigger>
            <TabsTrigger value="image">Image (OCR)</TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <TextPasteInput onConvert={onConvert} />
          </TabsContent>
          <TabsContent value="image">
            <ImageUploadInput onConvert={onConvert} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
