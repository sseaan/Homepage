import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import { remarkMarkdownExtras } from '../src/lib/remark-markdown-extras.mjs';

const parse = async (markdown: string) => {
  const processor = unified().use(remarkParse).use(remarkDirective).use(remarkMarkdownExtras);
  return processor.run(processor.parse(markdown)) as Promise<any>;
};

describe('remarkMarkdownExtras', () => {
  it('turns callouts into div.callout with a title', async () => {
    const tree = await parse(':::tip[提示]\n正文\n:::\n');
    const node = tree.children[0];
    expect(node.data.hName).toBe('div');
    expect(node.data.hProperties.className).toEqual(['callout', 'tip']);
    expect(node.children[0].data.hName).toBe('p');
    expect(node.children[0].data.hProperties.className).toEqual(['callout-title']);
    expect(node.children[0].children[0].value).toBe('提示');
  });

  it('supports custom and hidden callout icons', async () => {
    const tree = await parse(':::warning[注意]{icon=✨}\n正文\n:::\n');
    expect(tree.children[0].children[0].data.hProperties['data-icon']).toBe('✨');
  });

  it('turns details into details/summary and respects open', async () => {
    const tree = await parse(':::details[展开]{open}\n内容\n:::\n');
    const node = tree.children[0];
    expect(node.data.hName).toBe('details');
    expect(node.data.hProperties.open).toBe(true);
    expect(node.children[0].data.hName).toBe('summary');
    expect(node.children[0].children[0].value).toBe('展开');
  });

  it('marks block and inline spoilers for progressive enhancement', async () => {
    const tree = await parse(':::spoiler\n隐藏\n:::\n\n行内 :spoiler[剧透]\n');
    const block = tree.children[0];
    const inline = tree.children[1].children.find((child: any) => child.type === 'textDirective');
    expect(block.data.hProperties.className).toContain('spoiler--block');
    expect(block.data.hProperties['data-spoiler']).toBe('');
    expect(inline.data.hName).toBe('span');
    expect(inline.data.hProperties.className).toContain('spoiler');
  });

  it('wraps ==text== in mark but leaves a==b alone', async () => {
    const tree = await parse('这是 ==重点== 和 a==b。\n');
    const paragraph = tree.children[0];
    const marks = paragraph.children.filter((child: any) => child.data?.hName === 'mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].children[0].value).toBe('重点');
    expect(paragraph.children.map((child: any) => child.value).join('')).toContain('a==b');
  });
});
